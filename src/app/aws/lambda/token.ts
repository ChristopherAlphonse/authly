import type { APIGatewayProxyHandler } from "aws-lambda";

const GH_ROOT_PATH = "https://github.com/login/oauth/access_token";

// Parse form data without vulnerable lambda-multipart-parser
function parseFormData(body: string): Record<string, string> {
	const params = new URLSearchParams(body);
	const result: Record<string, string> = {};
	for (const [key, value] of params.entries()) {
		result[key] = value;
	}
	return result;
}

export const handler: APIGatewayProxyHandler = async (event) => {
	const body = event.isBase64Encoded
		? Buffer.from(event.body || "", "base64").toString("utf-8")
		: event.body || "";

	const result = parseFormData(body);
	const url = `${GH_ROOT_PATH}?client_id=${result.client_id}&client_secret=${result.client_secret}&code=${result.code}`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: { Accept: "application/json" },
		});

		const token = await response.json();

		return {
			statusCode: 200,
			body: JSON.stringify({ token }),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error }),
		};
	}
};
