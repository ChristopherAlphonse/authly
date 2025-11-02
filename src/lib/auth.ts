// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation

import { apiKey, jwt, twoFactor } from "better-auth/plugins";

import { SESSION_TIMEOUT } from "../constants/auth_constant";
import { betterAuth } from "better-auth";
import { db } from "../db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendVerificationEmail } from "@/email/aws-ses";

// NOTE: All user management and session handling is proxied to AWS Cognito.

export const auth = betterAuth({
	appName: "main-app-poc",
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	socialProviders: {
		...(process.env.COGNITO_CLIENT_ID &&
		process.env.COGNITO_CLIENT_SECRET &&
		process.env.COGNITO_DOMAIN &&
		process.env.COGNITO_USER_POOL_ID
			? {
					cognito: {
						clientId: process.env.COGNITO_CLIENT_ID,
						clientSecret: process.env.COGNITO_CLIENT_SECRET,
						domain: process.env.COGNITO_DOMAIN,
						region:
							process.env.AWS_REGION ||
							process.env.NEXT_PUBLIC_AWS_REGION ||
							"us-east-1",
						userPoolId: process.env.COGNITO_USER_POOL_ID,
					},
				}
			: {}),
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
						scope: ["openid", "email", "profile"],
					},
				}
			: {}),
		...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: process.env.GITHUB_CLIENT_ID,
						clientSecret: process.env.GITHUB_CLIENT_SECRET,
						scope: ["openid", "email", "profile"],
					},
				}
			: {}),
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	magicLink: {
		enabled: true,
	},
	emailVerification: {
		sendOnSignUp: !!process.env.AWS_SES_FROM,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			if (process.env.AWS_SES_FROM) {
				await sendVerificationEmail(user.email, url, user.email);
			}
		},
	},
	session: {
		expiresIn: SESSION_TIMEOUT.EXPIRESIN,
		updateAge: SESSION_TIMEOUT.UPDATEAGE,
	},
	logger: {
		disabled: process.env.NODE_ENV === "production",
	},
	plugins: [jwt(), apiKey({ enableMetadata: true }), twoFactor()],
	baseURL: "http://localhost:5173",
	trustedOrigins: [
		"http://localhost:5173",
		...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
		...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL
			? [process.env.NEXT_PUBLIC_BETTER_AUTH_URL]
			: []),
	],
});
