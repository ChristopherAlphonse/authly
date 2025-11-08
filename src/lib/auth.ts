import * as bcrypt from "bcrypt";

import {
	DEV_MODE,
	EMAIL_VERIFICATION_EXPIRES_IN,
	RESET_PASSWORD_EXPIRES_IN,
	SESSION_EXPIRES_IN,
	SESSION_UPDATE_AGE,
	TELEMETRY_ENABLED,
	TRUSTED_ORIGINS,
	formatExpiry,
} from "./utils";
import { jwt, magicLink } from "better-auth/plugins";

import EmailVerification from "../email/verify-email";
import MagicLinkEmail from "../email/magic-link";
import PasswordReset from "../email/reset-password";
// Reference: https://www.better-auth.com/docs/installation
import { Resend } from "resend";
import { betterAuth } from "better-auth";
import { db } from "../db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "better-auth/plugins/passkey";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailType = {
	user: { name: string; email: string };
	url: string;
};
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
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: DEV_MODE,
		requireEmailVerification: DEV_MODE,
		password: {
			async hash(password: string): Promise<string> {
				return bcrypt.hashSync(password, 10);
			},
			async verify({
				hash,
				password,
			}: {
				hash: string;
				password: string;
			}): Promise<boolean> {
				return bcrypt.compareSync(password, hash);
			},
		},
		resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRES_IN,
		sendResetPassword: async ({ user, url }: EmailType) => {
			await resend.emails.send({
				from: `Authly Password Reset <${process.env.EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Reset your password",
				react: PasswordReset({
					userEmail: user.email,
					resetUrl: url,
					expiryText: formatExpiry(RESET_PASSWORD_EXPIRES_IN),
				}),
			});
		},
		emailVerification: {
			expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
			sendVerificationEmail: async ({ user, url }: EmailType) => {
				const { name, email } = user;
				await resend.emails.send({
					from: `Authly Email Verification <${process.env.EMAIL_SENDER_ADDRESS}>`,
					to: email,
					subject: "Verify your email",
					react: EmailVerification({
						userName: name,
						verificationUrl: url,
						expiryText: formatExpiry(EMAIL_VERIFICATION_EXPIRES_IN),
					}),
				});
			},
		},
	},

	session: {
		expiresIn: SESSION_EXPIRES_IN,
		updateAge: SESSION_UPDATE_AGE,
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
		jwt(),
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
						expiryText: "10 minutes",
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
			"/sign-in/email": {
				window: 10,
				max: 3,
			},
		},
	},
	trustedOrigins: TRUSTED_ORIGINS,
});



(function envSanityCheck() {
	try {
		const warnings: string[] = [];
		const errors: string[] = [];

		if (!process.env.RESEND_API_KEY) {
			errors.push("Missing RESEND_API_KEY - Required for email sending");
		}
		if (!process.env.EMAIL_SENDER_NAME) {
			errors.push("Missing EMAIL_SENDER_NAME - Required for email sending");
		}
		if (!process.env.EMAIL_SENDER_ADDRESS) {
			errors.push("Missing EMAIL_SENDER_ADDRESS - Required for email sending");
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(process.env.EMAIL_SENDER_ADDRESS)) {
				errors.push(
					`Invalid EMAIL_SENDER_ADDRESS format: "${process.env.EMAIL_SENDER_ADDRESS}" - Must be a valid email address`,
				);
			}
		}

		// Check Google OAuth (only in production)
		if (process.env.NODE_ENV === "production") {
			if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
				warnings.push(
					"Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (google) - Required for Google OAuth in production",
				);
			}
		}

		if (errors.length > 0) {
			console.error(
				"[Env Check] Critical environment variable errors:",
				errors,
			);
		}
		if (warnings.length > 0) {
			console.warn(
				"[Env Check] Potentially missing environment variables:",
				warnings,
			);
		}
		if (errors.length === 0 && warnings.length === 0) {
			console.info(
				"[Env Check] Basic required environment variables appear present (non-sensitive check)",
			);

			console.info(`[Env Check] Telemetry enabled: ${TELEMETRY_ENABLED}`);
		}
	} catch (err) {
		console.warn("[Env Check] Failed to run environment sanity check", err);
	}
})();
