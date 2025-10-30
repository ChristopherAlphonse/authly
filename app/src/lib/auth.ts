// Auth configuration using better-auth as FE client, proxying to AWS Cognito for all user management and sessions.
// Reference: https://www.better-auth.com/docs/installation
import { apiKey, jwt, twoFactor } from "better-auth/plugins";
import { betterAuth } from "better-auth";

// Import sendEmail utility for SES integration
import { sendEmail } from "@/email/send-verification-email";

// NOTE: All user management and session handling is proxied to AWS Cognito.
// Local DB is not used for user credentials.

export const auth = betterAuth({
	appName: "main-app-poc",
	// Enable all required auth methods
	cognito: {
		userPoolId: process.env.COGNITO_USER_POOL_ID as string,
		clientId: process.env.COGNITO_CLIENT_ID as string,
		region: process.env.COGNITO_REGION as string,
		// Optionally, add domain, hosted UI, etc.
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
		// Password reset and verification handled by Cognito triggers
	},
	magicLink: {
		enabled: true,
	},
		// SAML and WebAuthn are enabled via Cognito configuration, not via local plugin
		// See Cognito docs for SAML and FIDO2/WebAuthn setup
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			// Use AWS SES via React Email for sending verification
			await sendEmail({
				email: user.email,
				subject: "Verify your email",
				text: `<p>Click the link to verify your email: <a href="${url}">Verify Email</a></p>`
			});
		},
	},
	session: {
		// Session expiration: 3 days (in seconds)
		expiresIn: 60 * 60 * 24 * 3,
		updateAge: 60 * 60 * 24,
	},
		plugins: [
			jwt(),
			apiKey({ enableMetadata: true }),
			twoFactor(),
			// SAML and WebAuthn handled by Cognito, not local plugin
		],
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5127",
});
