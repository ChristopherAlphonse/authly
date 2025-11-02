// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, jwt, twoFactor } from "better-auth/plugins";
import { sendVerificationEmail } from "@/email/aws-ses";
import { SESSION_TIMEOUT } from "../constants/auth_constant";
import { db } from "../db";

// NOTE: All user management and session handling is proxied to AWS Cognito.

export const auth = betterAuth({
	appName: "main-app-poc",
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	socialProviders: {
		cognito: {
			clientId: (process.env.COGNITO_CLIENT_ID ??
				process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) as string,
			clientSecret: (process.env.COGNITO_CLIENT_SECRET ??
				process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET) as string,
			domain: (process.env.COGNITO_DOMAIN ??
				process.env.NEXT_PUBLIC_COGNITO_DOMAIN) as string,
			region: (process.env.AWS_REGION ??
				process.env.NEXT_PUBLIC_AWS_REGION ??
				process.env.AuthlyCognitoRegion ??
				process.env.AUTHLY_COGNITO_REGION) as string,
			userPoolId: (process.env.COGNITO_USER_POOL_ID ??
				process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) as string,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	magicLink: {
		enabled: true,
	},
	emailVerification: {
		sendOnSignUp: !!process.env.AWS_SES_FROM, // Only enable if AWS SES is configured
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			// Only send email if AWS SES is configured
			if (process.env.AWS_SES_FROM) {
				await sendVerificationEmail(user.email, url, user.email);
			}
		},
	},
	session: {
		accessTokenExpiresIn: SESSION_TIMEOUT.ACCESSTOKENEXPIRESIN,
		refreshTokenExpiresIn: SESSION_TIMEOUT.REFRESHTOKENEXPIRESIN,
		idleTimeout: SESSION_TIMEOUT.IDLETIMEOUT,
		idleTimeoutWarn: SESSION_TIMEOUT.IDLETIMEOUTWARN,
		expiresIn: SESSION_TIMEOUT.EXPIRESIN,
		updateAge: SESSION_TIMEOUT.UPDATEAGE,
	},
	logger: {
		disabled: process.env.NODE_ENV === "production",
	},
	plugins: [jwt(), apiKey({ enableMetadata: true }), twoFactor()],
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
});
