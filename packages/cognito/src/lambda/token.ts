import type { APIGatewayProxyHandler } from "aws-lambda";
import parser from "lambda-multipart-parser";

const GH_ROOT_PATH = "https://github.com/login/oauth/access_token";

export const handler: APIGatewayProxyHandler = async (event) => {
	const result = await parser.parse(event);
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
