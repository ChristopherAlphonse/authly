import type { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import { PasswordResetEmail } from "./password-reset-email";
import { VerificationEmail } from "./verification-email";
import { WelcomeEmail } from "./welcome-email";

// Lazy initialization - only create SES client when actually needed (runtime, not build time)
let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
	if (!sesClient) {
		const region = process.env.AWS_REGION || "us-east-1";
		sesClient = new SESClient({
			region,
			// credentials: rely on SDK defaults (ENV vars, IAM role, etc.)
		});
	}
	return sesClient;
}

type SendArgs = {
	to: string;
	subject: string;
	html: string;
	text?: string;
};

export async function sendRenderedEmail({ to, subject, html, text }: SendArgs) {
	const from = process.env.AWS_SES_FROM || "";

	if (!from) {
		throw new Error(
			"SES from address not configured. Set AWS_SES_FROM environment variable.",
		);
	}

	const params: SendEmailCommandInput = {
		Destination: { ToAddresses: [to] },
		Message: {
			Body: {
				Html: { Data: html, Charset: "UTF-8" },
				...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
			},
			Subject: { Data: subject, Charset: "UTF-8" },
		},
		Source: from,
	};

	const ses = getSESClient();
	try {
		await ses.send(new SendEmailCommand(params));
	} catch (err) {
		try {
			console.error(
				"SES send error",
				{
					to,
					from: process.env.AWS_SES_FROM,
					region: process.env.AWS_REGION || "us-east-1",
				},
				err,
			);
		} catch {
			console.error("SES send error (failed to log context)", err);
		}

		throw err;
	}
}

export async function sendPasswordResetEmail(
	to: string,
	resetUrl: string,
	userEmail?: string,
) {
	const html = await render(
		<PasswordResetEmail resetUrl={resetUrl} userEmail={userEmail} />,
	);
	return sendRenderedEmail({ to, subject: "Reset your Authly password", html });
}

export async function sendWelcomeEmail(
	to: string,
	verifyUrl?: string,
	userEmail?: string,
) {
	const html = await render(
		<WelcomeEmail verifyUrl={verifyUrl} userEmail={userEmail} />,
	);
	return sendRenderedEmail({ to, subject: "Welcome to Authly!", html });
}

export async function sendVerificationEmail(
	to: string,
	verifyUrl: string,
	userEmail?: string,
) {
	const html = await render(
		<VerificationEmail verifyUrl={verifyUrl} userEmail={userEmail} />,
	);
	return sendRenderedEmail({ to, subject: "Verify your email", html });
}

const awsSes = {
	sendRenderedEmail,
	sendPasswordResetEmail,
	sendWelcomeEmail,
	sendVerificationEmail,
};

export default awsSes;
