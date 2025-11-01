// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation
import { apiKey, jwt, twoFactor } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { sendVerificationEmail } from "@/email/aws-ses";
import { SESSION_TIMEOUT } from "../constant/auth_contant";

// NOTE: All user management and session handling is proxied to AWS Cognito.

export const auth = betterAuth({
	appName: "main-app-poc",
    cognito: {
		userPoolId: process.env.COGNITO_USER_POOL_ID as string,
		clientId: process.env.COGNITO_CLIENT_ID as string,
		region: process.env.COGNITO_REGION as string,

	},
	// Social providers (if federated via Cognito)
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
	// Email/password, magic link, FIDO2/WebAuthn, SAML SSO
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
	// Session and token lifetimes
	// - accessTokenExpiresIn: short-lived access token (limits damage if compromised)
	// - refreshTokenExpiresIn: longer-lived refresh token used to obtain new access tokens
	// - idleTimeout: inactivity timeout (in seconds) that forces re-authentication
	// - idleTimeoutWarn: seconds before idleTimeout to warn the user
	session: {
		accessTokenExpiresIn: SESSION_TIMEOUT.ACCESSTOKENEXPIRESIN,
		refreshTokenExpiresIn: SESSION_TIMEOUT.REFRESHTOKENEXPIRESIN,
		idleTimeout: SESSION_TIMEOUT.IDLETIMEOUT,
		idleTimeoutWarn: SESSION_TIMEOUT.IDLETIMEOUTWARN,
		expiresIn: SESSION_TIMEOUT.EXPIRESIN,
		updateAge: SESSION_TIMEOUT.UPDATEAGE,
	},
		plugins: [
			jwt(),
			apiKey({ enableMetadata: true }),
			twoFactor(),
		],

	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
});

