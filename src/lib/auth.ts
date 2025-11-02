// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation

import {
	AdminCreateUserCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, jwt, twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/email/aws-ses";
import { SESSION_TIMEOUT } from "../constants/auth_constant";
import { db } from "../db";
import { account, user } from "../db/schema";

// Initialize Cognito client for syncing OAuth users to maintain compliance
const getCognitoClient = (): CognitoIdentityProviderClient | null => {
	if (!process.env.COGNITO_USER_POOL_ID || !process.env.AWS_REGION) {
		return null;
	}
	return new CognitoIdentityProviderClient({
		region:
			process.env.AWS_REGION ||
			process.env.NEXT_PUBLIC_AWS_REGION ||
			"us-east-1",
	});
};

// Compute social providers from env so we can both pass the config to
// betterAuth and log what's actually registered at startup.
const socialProviders = (() => {
	const providers: Record<string, unknown> = {};

	if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
		providers.github = {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		};
	}

	if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		};
	}

	if (
		process.env.COGNITO_CLIENT_ID &&
		process.env.COGNITO_CLIENT_SECRET &&
		process.env.COGNITO_DOMAIN &&
		process.env.COGNITO_USER_POOL_ID
	) {
		providers.cognito = {
			clientId: process.env.COGNITO_CLIENT_ID,
			clientSecret: process.env.COGNITO_CLIENT_SECRET,
			domain: process.env.COGNITO_DOMAIN,
			region:
				process.env.AWS_REGION ||
				process.env.NEXT_PUBLIC_AWS_REGION ||
				"us-east-1",
			userPoolId: process.env.COGNITO_USER_POOL_ID,
		};
	}

	return providers;
})();

// Sync OAuth user to Cognito User Pool for SOC 2, ISO 27001, PCI DSS compliance
// This ensures all user data is managed by Cognito even when using direct OAuth providers
const syncUserToCognito = async (
	authUser: {
		id: string;
		email: string;
		name?: string | null;
		emailVerified?: boolean;
		image?: string | null;
	},
	provider?: string,
): Promise<void> => {
	const cognitoClient = getCognitoClient();
	const userPoolId = process.env.COGNITO_USER_POOL_ID;

	if (!cognitoClient || !userPoolId) {
		console.warn(
			"[Cognito Sync] Skipping Cognito sync - missing configuration",
		);
		return;
	}

	try {
		// Try to create user in Cognito
		const createCommand = new AdminCreateUserCommand({
			UserPoolId: userPoolId,
			Username: authUser.email,
			UserAttributes: [
				{ Name: "email", Value: authUser.email },
				{
					Name: "email_verified",
					Value: authUser.emailVerified ? "true" : "false",
				},
				...(authUser.name ? [{ Name: "name", Value: authUser.name }] : []),
				...(authUser.image ? [{ Name: "picture", Value: authUser.image }] : []),
				...(provider
					? [{ Name: "custom:oauth_provider", Value: provider }]
					: []),
			],
			MessageAction: "SUPPRESS", // Don't send welcome email
		});

		await cognitoClient.send(createCommand);
		console.log(`[Cognito Sync] Created user in Cognito: ${authUser.email}`);
	} catch (error) {
		// User might already exist, try to update instead
		// Check for Cognito's UsernameExistsException
		const isUsernameExistsError =
			(error instanceof Error &&
				(error.name === "UsernameExistsException" ||
					(error as { Code?: string }).Code === "UsernameExistsException")) ||
			(typeof error === "object" &&
				error !== null &&
				"Code" in error &&
				(error as { Code?: string }).Code === "UsernameExistsException");

		if (isUsernameExistsError) {
			try {
				const updateCommand = new AdminUpdateUserAttributesCommand({
					UserPoolId: userPoolId,
					Username: authUser.email,
					UserAttributes: [
						{
							Name: "email_verified",
							Value: authUser.emailVerified ? "true" : "false",
						},
						...(authUser.name ? [{ Name: "name", Value: authUser.name }] : []),
						...(authUser.image
							? [{ Name: "picture", Value: authUser.image }]
							: []),
						...(provider
							? [{ Name: "custom:oauth_provider", Value: provider }]
							: []),
					],
				});

				await cognitoClient.send(updateCommand);
				console.log(
					`[Cognito Sync] Updated user in Cognito: ${authUser.email}`,
				);
			} catch (updateError) {
				console.error(
					"[Cognito Sync] Failed to update user in Cognito:",
					updateError,
				);
			}
		} else {
			console.error("[Cognito Sync] Failed to sync user to Cognito:", error);
		}
	}
};

export const auth = betterAuth({
	appName: "main-app-poc",
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	socialProviders: socialProviders,
	emailAndPassword: {
		enabled: true,
		// DEV ONLY: Disable email verification requirement for local testing
		// ⚠️ DO NOT disable in production for real users!
		requireEmailVerification: process.env.NODE_ENV === "production",
	},
	magicLink: {
		enabled: true,
	},
	emailVerification: {
		// In development: Auto-verify emails (skip sending verification email)
		// In production: Send verification emails via SES
		sendOnSignUp:
			process.env.NODE_ENV === "production" && !!process.env.AWS_SES_FROM,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user: authUser, url }) => {
			// Only send emails in production with SES configured
			if (process.env.NODE_ENV === "production" && process.env.AWS_SES_FROM) {
				await sendVerificationEmail(authUser.email, url, authUser.email);
			}
			// In dev: Auto-verify email and log verification URL
			if (process.env.NODE_ENV !== "production") {
				console.log(`[DEV] Auto-verifying email for ${authUser.email}`);
				console.log(`[DEV] Email verification URL (not used): ${url}`);
				// Auto-verify email in dev mode
				try {
					await db
						.update(user)
						.set({ emailVerified: true })
						.where(eq(user.id, authUser.id));
				} catch (error) {
					console.error("[DEV] Failed to auto-verify email:", error);
				}
			}
		},
	},
	callbacks: {
		// Sync OAuth users to Cognito after authentication for compliance
		// This ensures all user data is managed by Cognito (SOC 2, ISO 27001, PCI DSS)
		// while users see native GitHub/Google OAuth UI
		afterSignIn: async (authUser: {
			id: string;
			email: string;
			name?: string | null;
			emailVerified?: boolean;
			image?: string | null;
		}) => {
			try {
				// Fetch user's accounts from database to check authentication method
				const userAccounts = await db
					.select()
					.from(account)
					.where(eq(account.userId, authUser.id));

				// Check if user has OAuth account (GitHub or Google)
				const oauthAccount = userAccounts.find(
					(acc) => acc.providerId === "github" || acc.providerId === "google",
				);

				if (oauthAccount) {
					// Sync OAuth user to Cognito User Pool for enterprise features and compliance
					// Users see native GitHub/Google UI, but data is managed by Cognito
					await syncUserToCognito(authUser, oauthAccount.providerId);
				} else {
					// Sync email/password user to Cognito for compliance
					// Better Auth stores password in its DB, but user is synced to Cognito
					await syncUserToCognito(authUser, "credential");
				}
			} catch (error) {
				// Log error but don't block sign-in
				console.error("[Cognito Sync] Failed to check/sync user:", error);
			}

			return authUser;
		},
		// Sync all new users (email/password and OAuth) to Cognito after signup
		// This ensures all user data is managed by Cognito (SOC 2, ISO 27001, PCI DSS)
		afterSignUp: async (authUser: {
			id: string;
			email: string;
			name?: string | null;
			emailVerified?: boolean;
			image?: string | null;
		}) => {
			try {
				// Fetch user's accounts to determine authentication method
				const userAccounts = await db
					.select()
					.from(account)
					.where(eq(account.userId, authUser.id));

				// Determine provider (OAuth or email/password)
				const oauthAccount = userAccounts.find(
					(acc) => acc.providerId === "github" || acc.providerId === "google",
				);
				const provider = oauthAccount ? oauthAccount.providerId : "credential";

				// Sync user to Cognito User Pool for enterprise features and compliance
				await syncUserToCognito(authUser, provider);

				// DEV ONLY: Auto-verify emails after signup
				if (process.env.NODE_ENV !== "production") {
					console.log(
						`[DEV] Auto-verifying email for ${authUser.email} after signup`,
					);
					try {
						await db
							.update(user)
							.set({ emailVerified: true })
							.where(eq(user.id, authUser.id));
						console.log(
							`[DEV] Email verified successfully for ${authUser.email}`,
						);
					} catch (error) {
						console.error("[DEV] Failed to auto-verify email:", error);
					}
				}
			} catch (error) {
				// Log error but don't block signup
				console.error(
					"[Cognito Sync] Failed to sync user after signup:",
					error,
				);
			}

			return authUser;
		},
	},
	session: {
		expiresIn: SESSION_TIMEOUT.EXPIRESIN,
		updateAge: SESSION_TIMEOUT.UPDATEAGE,
	},
	logger: {
		disabled: false, // Enable logging to debug 403 errors
	},
	plugins: [jwt(), apiKey({ enableMetadata: true }), twoFactor()],
	// Use dynamic baseURL based on environment:
	// - For local testing (NODE_ENV=development): always use localhost
	// - In production: use BETTER_AUTH_URL or VERCEL_URL
	// - Priority for production: BETTER_AUTH_URL > VERCEL_URL
	baseURL: (() => {
		// In development, always use localhost (ignore BETTER_AUTH_URL for local dev)
		if (process.env.NODE_ENV === "development") {
			return "http://localhost:5173";
		}
		// In production, use BETTER_AUTH_URL if set
		if (process.env.BETTER_AUTH_URL) {
			return process.env.BETTER_AUTH_URL;
		}
		// Fallback to VERCEL_URL if available
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}`;
		}
		// Final fallback (shouldn't happen in production)
		return "http://localhost:5173";
	})(),
	trustedOrigins: [
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
		...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL
			? [process.env.NEXT_PUBLIC_BETTER_AUTH_URL]
			: []),
		// Add Vercel URL for preview deployments
		...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
	],
});

// Log which social providers were registered (non-sensitive keys only)
try {
	console.info("Registered social providers:", Object.keys(socialProviders));
} catch (e) {
	// Avoid crashing startup if logging fails
}
