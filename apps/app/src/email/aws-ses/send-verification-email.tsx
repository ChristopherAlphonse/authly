// Uses AWS SES with React Email for sending emails
// Reference: https://react.email/docs/integrations/aws-ses
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";

export const sendEmail = async ({
	email,
	subject,
	text,
}: {
	email: string;
	subject: string;
	// text can be plain HTML/text or a React element from react-email templates
	text: string | React.ReactElement;
}) => {
	// Render HTML using React Email (if text is a React element, otherwise use as is)
	const html = typeof text === "string" ? text : await render(text);

	const ses = new SESClient({
		region: process.env.AWS_REGION || "us-east-1",
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
		},
	});

	const params = {
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Body: {
				Html: { Data: html },
			},
			Subject: { Data: subject },
		},
		Source: process.env.SES_FROM_ADDRESS || "",
	};

	await ses.send(new SendEmailCommand(params));
	return true;
};
