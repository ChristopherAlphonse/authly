import * as bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, magicLink } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
// Reference: https://www.better-auth.com/docs/installation
import { Resend } from "resend";
import { db } from "../db";
import MagicLinkEmail from "../email/magic-link";
import PasswordReset from "../email/reset-password";
import EmailVerification from "../email/verify-email";
import { isENVLoaded } from "./env";
import {
	DEV_MODE,
	EMAIL_VERIFICATION_EXPIRES_IN,
	formatExpiry,
	RESET_PASSWORD_EXPIRES_IN,
	SESSION_EXPIRES_IN,
	SESSION_UPDATE_AGE,
	TELEMETRY_ENABLED,
	TRUSTED_ORIGINS,
} from "./utils";

isENVLoaded();

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
