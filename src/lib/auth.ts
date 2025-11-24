import { TELEMETRY_ENABLED, isENVLoaded } from "./env";
import { TRUSTED_ORIGINS, formatExpiry } from "./utils";
import {
	formatLoginTime,
	getIPAddress,
} from "./email-utils";

import EmailVerification from "../email/verify-email";
import LoginNotification from "../email/login-notification";
import MagicLinkEmail from "../email/magic-link";
// Reference: https://www.better-auth.com/docs/installation
import { Resend } from "resend";
import WelcomeEmail from "../email/welcome";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "../db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { logger } from "@calphonse/logger";
import { magicLink } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

isENVLoaded();

logger.info(
	formatExpiry(Number.parseInt(process.env.RESET_PASSWORD_EXPIRES_IN!, 10)),
);

const resend = new Resend(process.env.RESEND_API_KEY);

const getBaseURL = (): string => {
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:5173";
	}
	const firstValidOrigin = TRUSTED_ORIGINS.find(
		(origin) => origin && origin.trim() !== "" && origin !== "undefined",
	);
	return firstValidOrigin?.replace(/\/+$/, "") ?? "http://localhost:5173";
};

export const auth = betterAuth({
	appName: "main-app-poc",
	baseURL: getBaseURL(),
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	telemetry: {
		enabled: TELEMETRY_ENABLED,
	},
	// Disable email and password authentication - we're using passwordless
	emailAndPassword: {
		enabled: false,
	},
	// Email verification configuration
	emailVerification: {
		sendOnSignUp: true, // Automatically send verification email on signup
		autoSignInAfterVerification: true, // Auto sign in after email verification
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: `Authly Single Sign-On <${process.env.EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Verify your email address",
				react: EmailVerification({
					userName: user.name || user.email,
					verificationUrl: url,
					expiryText: formatExpiry(
						Number.parseInt(process.env.RESET_PASSWORD_EXPIRES_IN!, 10),
					),
				}),
			});
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},

	session: {
		expiresIn: 300,
		updateAge: 200,
		cookie: {
			name: "__Secure-session",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
		},
	},
	logger: {
		disabled: process.env.NODE_ENV === "production",
	},
	plugins: [
		passkey(),
		magicLink({
			expiresIn: 600, // 10 minutes
			sendMagicLink: async ({ email, url }) => {
				await resend.emails.send({
					from: `Authly Single Sign-On <${process.env.EMAIL_SENDER_ADDRESS}>`,
					to: email,
					subject: "Sign in to your Authly account",
					react: MagicLinkEmail({
						userEmail: email,
						magicLinkUrl: url,
						expiryText: formatExpiry(
							Number.parseInt(process.env.RESET_PASSWORD_EXPIRES_IN!, 10),
						),
					}),
				});
			},
		}),
	],
	tokens: {
		rotation: "always",
		secret: process.env.BETTER_AUTH_SECRET!,
	},
	rateLimit: {
		storage: "database",
		modelName: "rateLimit",
		window: 60,
		max: 100,
		customRules: {
			"/sign-in/magic-link": {
				window: 10,
				max: 3,
			},
            "/api/passkey/has-passkeys": {
				window: 10,
				max: 3,
			},
            "/api/auth/get-session": {
				window: 10,
				max: 3,
			},
            "/api/passkey/check-returning-user": {
				window: 60,
				max: 30,
			},
		},
	},
	trustedOrigins: TRUSTED_ORIGINS,
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			// Handle welcome email for new users and login notifications
			if (
				ctx.path === "/sign-in/magic-link" ||
				ctx.path === "/sign-in/social" ||
				ctx.path === "/sign-in/passkey" ||
				ctx.path === "/magic-link/verify"
			) {
				const newSession = ctx.context.newSession;
				if (newSession?.user) {
					const user = newSession.user;
					const request = ctx.request;

					// Check if this is a new user by checking if they were just created
					// We'll check the user's createdAt timestamp
					// If the user was created very recently (within last 5 minutes), send welcome email
					const userCreatedAt = user.createdAt
						? new Date(user.createdAt)
						: null;
					const isNewUser =
						userCreatedAt &&
						Date.now() - userCreatedAt.getTime() < 300000; // Within 5 minutes

					// Send welcome email for new users (don't await to avoid blocking)
					if (isNewUser) {
						resend.emails
							.send({
								from: `Authly Single Sign-On <${process.env.EMAIL_SENDER_ADDRESS}>`,
								to: user.email,
								subject: "Welcome to Authly!",
								react: WelcomeEmail({
									userName: user.name || user.email,
									userEmail: user.email,
								}),
							})
							.then(() => {
								logger.info(`[Welcome Email] Sent to ${user.email}`);
							})
							.catch((error: unknown) => {
								const errorMessage =
									error instanceof Error ? error.message : String(error);
								logger.error(
									`[Welcome Email] Failed to send to ${user.email}: ${errorMessage}`,
								);
							});
					}

					// Send login notification email for all sign-ins (don't await to avoid blocking)
					(async () => {
						try {
							if (!request) {
								logger.warn("[Login Notification] Request object is missing");
								return;
							}

							const userAgent = request?.headers.get("user-agent") || "Unknown";
							const loginTime = formatLoginTime(new Date());

							// Get IP address from request headers first
							const requestIP = getIPAddress(request);
							logger.info(`[Login Notification] Request IP from headers: ${requestIP}`);

							// Fetch location and IP info from our API endpoint
							// API will handle localhost detection and fetch real IP
							let ipAddress = "Unknown";
							let city: string | null = null;
							let state: string | null = null;
							let country: string | null = null;
							let location = "Unknown";

							try {
								// Use request URL to construct API endpoint (works for both dev and prod)
								const requestUrl = new URL(request.url);
								const apiBase = `${requestUrl.protocol}//${requestUrl.host}`;
								// Always call API - it will handle localhost and fetch real IP
								const apiUrl = `${apiBase}/api/ip?ip=${encodeURIComponent(requestIP)}`;
								logger.info(`[Login Notification] Calling API: ${apiUrl}`);

								const ipResponse = await fetch(apiUrl);
								logger.info(`[Login Notification] API response status: ${ipResponse.status}`);
								console.log(`[Login Notification] API response status: ${ipResponse.status}`);

								let geoData: {
									ip?: string;
									city?: string | null;
									state?: string | null;
									region?: string | null;
									country_name?: string | null;
									rateLimited?: boolean;
									error?: string;
									message?: string;
								};

								if (!ipResponse.ok) {
									// Try to parse error response - it might still have IP
									try {
										const errorText = await ipResponse.text();
										console.error(`[Login Notification] API error response: ${errorText}`);
										logger.error(`[Login Notification] API error response: ${errorText}`);

										// Try to parse as JSON in case it has IP
										try {
											geoData = JSON.parse(errorText);
											// If we got IP from error response, use it
											if (geoData.ip && geoData.ip !== "127.0.0.1" && geoData.ip !== "::1" && geoData.ip !== "localhost") {
												console.log(`[Login Notification] Got IP from error response: ${geoData.ip}`);
												logger.info(`[Login Notification] Got IP from error response: ${geoData.ip}`);
											} else {
												throw new Error(`API returned status ${ipResponse.status}: ${errorText}`);
											}
										} catch {
											throw new Error(`API returned status ${ipResponse.status}: ${errorText}`);
										}
									} catch {
										throw new Error(`API returned status ${ipResponse.status}`);
									}
								} else {
									geoData = await ipResponse.json();
								}

								// Log API response data clearly
								console.log("=".repeat(80));
								console.log("[Login Notification] API RESPONSE DATA:");
								console.log(JSON.stringify(geoData, null, 2));
								console.log("=".repeat(80));
								logger.info(`[Login Notification] API response data:`, JSON.stringify(geoData, null, 2));

								// Check for rate limiting or errors, but still use IP if available
								if (geoData.rateLimited) {
									console.warn("[Login Notification] API rate limited, using IP only");
									logger.warn(`[Login Notification] API rate limited: ${geoData.message || "Rate limit exceeded"}`);
								} else if (geoData.error && !geoData.ip) {
									// Only throw if we don't have an IP address
									console.error("[Login Notification] API ERROR:", geoData.error);
									logger.error(`[Login Notification] API returned error: ${geoData.error}`);
									throw new Error(geoData.error);
								} else if (geoData.error) {
									// Has error but also has IP - log warning but continue
									console.warn("[Login Notification] API error, but IP available:", geoData.error);
									logger.warn(`[Login Notification] API returned error: ${geoData.error}`);
								}

								// CRITICAL: ALWAYS use IP from API response - NEVER use requestIP
								// Validate that it's not localhost
								const apiIP = geoData.ip;
								if (!apiIP) {
									throw new Error("API did not return an IP address");
								}

								// NEVER accept localhost from API
								if (apiIP === "127.0.0.1" || apiIP === "::1" || apiIP === "localhost" || apiIP === "unknown") {
									console.error(`[Login Notification] ERROR: API returned localhost IP: ${apiIP}`);
									logger.error(`[Login Notification] API returned localhost IP: ${apiIP}`);
									throw new Error(`API returned invalid IP: ${apiIP}`);
								}

								// Use the IP from API - this is the REAL IP
								ipAddress = apiIP;
								city = geoData.city || null;
								state = geoData.state || geoData.region || null;
								country = geoData.country_name || null;

								console.log("[Login Notification] EXTRACTED VALUES:");
								console.log(`  IP Address: ${ipAddress}`);
								console.log(`  City: ${city}`);
								console.log(`  State: ${state}`);
								console.log(`  Country: ${country}`);
								logger.info(`[Login Notification] Extracted data - IP: ${ipAddress}, City: ${city}, State: ${state}, Country: ${country}`);

								// Format as "City, State, Country" (filtering out null/Unknown values)
								const locationParts = [city, state, country].filter(
									(part): part is string => part !== null && part !== undefined && part !== "Unknown",
								);
								location = locationParts.length > 0
									? locationParts.join(", ")
									: geoData.rateLimited
										? "Rate Limited - Location Unavailable"
										: "Unknown";
								logger.info(`[Login Notification] Final location string: ${location}`);
							} catch (geoError: unknown) {
								const geoErrorMessage =
									geoError instanceof Error ? geoError.message : String(geoError);

								logger.error(
									`[Login Notification] Failed to fetch location: ${geoErrorMessage}`,
								);
								logger.error(`[Login Notification] Error stack:`, geoError instanceof Error ? geoError.stack : "No stack trace");
								// Never fallback to localhost - keep as "Unknown"
								// IP will remain "Unknown" if API call completely fails
							}

							logger.info(`[Login Notification] Final values - IP: ${ipAddress}, Location: ${location}`);
							console.log("[Login Notification] FINAL VALUES FOR EMAIL:");
							console.log(`  IP Address: ${ipAddress}`);
							console.log(`  Location: ${location}`);
							console.log(`  City: ${city}`);
							console.log(`  State: ${state}`);
							console.log(`  Country: ${country}`);

							// Final validation: NEVER send localhost to email
							if (ipAddress === "127.0.0.1" || ipAddress === "::1" || ipAddress === "localhost" || ipAddress === "unknown") {
								console.error(`[Login Notification] CRITICAL ERROR: Attempting to send localhost IP to email: ${ipAddress}`);
								logger.error(`[Login Notification] CRITICAL: Attempting to send localhost IP: ${ipAddress}`);
								ipAddress = "Unknown"; // Better to show Unknown than localhost
							}

							// Ensure IP is never "Unknown" if we got it from API
							if (ipAddress === "Unknown") {
								console.warn("[Login Notification] WARNING: IP address is Unknown, this should not happen!");
								logger.warn("[Login Notification] IP address is Unknown");
							}

							console.log("=".repeat(80));
							console.log("[Login Notification] ATTEMPTING TO SEND EMAIL:");
							console.log(`  To: ${user.email}`);
							console.log(`  From: ${process.env.EMAIL_SENDER_ADDRESS}`);
							console.log(`  IP: ${ipAddress}`);
							console.log(`  Location: ${location}`);
							console.log("=".repeat(80));

							const emailResult = await resend.emails.send({
								from: `Authly Single Sign-On <${process.env.EMAIL_SENDER_ADDRESS}>`,
								to: user.email,
								subject: "New sign-in detected on your Authly account",
								react: LoginNotification({
									userName: user.name || user.email,
									userEmail: user.email,
									ipAddress: ipAddress,
									location,
									userAgent,
									loginTime,
								}),
							});

							console.log("[Login Notification] Email send result:", JSON.stringify(emailResult, null, 2));
							logger.info(`[Login Notification] Sent to ${user.email}`, emailResult);
							console.log(`[Login Notification] ✅ Email sent successfully to ${user.email}`);
						} catch (error: unknown) {
							const errorMessage =
								error instanceof Error ? error.message : String(error);
							const errorStack = error instanceof Error ? error.stack : undefined;

							console.error("=".repeat(80));
							console.error("[Login Notification] ❌ EMAIL SEND FAILED:");
							console.error(`  To: ${user.email}`);
							console.error(`  Error: ${errorMessage}`);
							if (errorStack) {
								console.error(`  Stack: ${errorStack}`);
							}
							if (error && typeof error === "object" && "response" in error) {
								console.error(`  Response:`, JSON.stringify(error.response, null, 2));
							}
							console.error("=".repeat(80));

							logger.error(
								`[Login Notification] Failed to send to ${user.email}: ${errorMessage}`,
							);
							if (errorStack) {
								logger.error(`[Login Notification] Error stack: ${errorStack}`);
							}
						}
					})();
				}
			}
		}),
	},
});
