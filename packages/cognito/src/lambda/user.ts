import type { APIGatewayProxyHandler } from "aws-lambda";

const GH_API_URL = "https://api.github.com/user";

export const handler: APIGatewayProxyHandler = async (event) => {
	const authHeaders = event.headers.Authorization;

	if (!authHeaders) {
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Unauthorized" }),
		};
	}
	try {
		const response = await fetch(GH_API_URL, {
			method: "GET",
			headers: {
					authorization: `token ${authHeaders.split("Bearer ")[1]}`,
				accept: "application/json",
			},
		});
		const token = (await response.json()) as { id: string };
		return {
			statusCode: 200,
			body: JSON.stringify({
				sub: token.id,
				...token,
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error }),
		};
	}
};
