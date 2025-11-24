import { logger } from "@calphonse/logger";
import "server-only";


const LOCAL_DB_URL = process.env.DATABASE_URL!;
const PROD_DB_URL = process.env.DATABASE_URL_PROD!;
const NODE_ENV = process.env.NODE_ENV;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const EMAIL_SENDER_ADDRESS = process.env.EMAIL_SENDER_ADDRESS!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const TELEMETRY_ENABLED = !!process.env.BETTER_AUTH_TELEMETRY




export function isENVLoaded(): void {
	const nodeEnv = NODE_ENV ?? "development";
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!BETTER_AUTH_SECRET)
		errors.push("Missing BETTER_AUTH_SECRET - required for token signing");
	if (!RESEND_API_KEY)
		errors.push("Missing RESEND_API_KEY - required for sending emails");

	const sender = EMAIL_SENDER_ADDRESS;

	if (!sender)
		errors.push("Missing EMAIL_SENDER_ADDRESS - required as the From address");

	if (nodeEnv === "production" && !PROD_DB_URL)
		errors.push(
			"Missing DATABASE_URL_PROD or DATABASE_URL for production database connection",
		);

	if (!LOCAL_DB_URL)
		warnings.push(
			"DATABASE_URL not set - dev will fall back to local default in src/db/index.ts",
		);

	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)
		warnings.push(
			"Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET - Google OAuth will not work",
		);

if (!process.env.RESET_PASSWORD_EXPIRES_IN)
		warnings.push(
			"Missing TIME FOR PASSWORD RESET in .env",
		);


	if (errors.length > 0) {
		const message = [
			"Environment validation failed with errors:",
			...errors.map((e) => ` - ${e}`),
		].join("\n");
		throw new Error(message);
	}

	if (warnings.length > 0) {
		const warningMessage = warnings.map((w) => ` - ${w}`).join("\n");
		logger.warn(`[ENV] Warnings:\n${warningMessage}`);
	}

	logger.info("[ENV] All required environment variables are present.");
}
