// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation
import { apiKey, jwt, twoFactor } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { sendVerificationEmail } from "@/email/aws-ses";
import { SESSION_TIMEOUT } from "../constant/auth_contant";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";


// NOTE: All user management and session handling is proxied to AWS Cognito.

export const auth = betterAuth({
	appName: "main-app-poc",
    database: drizzleAdapter(
        db,{
            provider: "pg"
        }
    ),
	cognito: {
		userPoolId: (process.env.COGNITO_USER_POOL_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) as string,
		clientId: (process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) as string,
		region: (process.env.AWS_REGION ?? process.env.NEXT_PUBLIC_AWS_REGION ?? process.env.AuthlyCognitoRegion ?? process.env.AUTHLY_COGNITO_REGION) as string,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
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
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url, user.email);
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
		plugins: [
			jwt(),
			apiKey({ enableMetadata: true }),
			twoFactor(),
		],
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
});

