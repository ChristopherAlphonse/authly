import { registeredSocialProviders } from "@/lib/auth";

export async function GET() {

	const ses = {
		configured: !!(
			process.env.AWS_REGION &&
			(process.env.AWS_SES_SENDER || process.env.AWS_SES_FROM)
		),
		fromConfigured: !!(process.env.AWS_SES_SENDER || process.env.AWS_SES_FROM),
		region: process.env.AWS_REGION || null,

		credsPresent: !!(
			process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
		),
	};

	const body = {
		ok: true,
		providers: registeredSocialProviders,
		ses,
		timestamp: new Date().toISOString(),
	};

	return new Response(JSON.stringify(body, null, 2), {
		headers: { "Content-Type": "application/json" },
	});
}
