// AWS SES email sending using AWS SDK
// Uses IAM credentials automatically when running in Lambda, ECS, or EC2
// For local development, use AWS CLI credentials or .aws/credentials

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
	region: process.env.AWS_REGION || "us-east-1",
	// credentials: rely on SDK defaults (ENV vars, IAM role, etc.)
});

export async function sendEmail(
	to: string,
	subject: string,
	html: string,
): Promise<void> {
	const source = process.env.AWS_SES_SENDER || process.env.AWS_SES_FROM;

	if (!source) {
		// In development, log instead of throwing if SES is not configured
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				`[DEV] Email not sent - SES not configured. Would send to ${to} with subject: ${subject}`,
			);
			return;
		}
		throw new Error(
			"AWS_SES_SENDER or AWS_SES_FROM environment variable is required",
		);
	}

	try {
		await ses.send(
			new SendEmailCommand({
				Destination: { ToAddresses: [to] },
				Message: {
					Subject: { Data: subject },
					Body: { Html: { Data: html } },
				},
				Source: source,
			}),
		);
	} catch (error) {
		// In development, log instead of throwing if SES send fails
		if (process.env.NODE_ENV !== "production") {
			console.warn("[DEV] Email send failed:", error);
			return;
		}
		throw error;
	}
}
