import { jwtClient, magicLinkClient, passkeyClient } from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
	if (typeof window !== "undefined") {
		return "";
	}

	const envUrl =
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL;
	if (envUrl && typeof envUrl === "string") return envUrl.replace(/\/+$/, "");

	return "http://localhost:5173";
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [jwtClient(), magicLinkClient(), passkeyClient()],
	fetchOptions: {
		onError: async (context) => {
			const { response } = context;
			if (response.status === 429) {
				const retryAfter = response.headers.get("X-Retry-After");
				console.warn(
					`Rate limit exceeded. Retry after ${retryAfter} seconds`,
				);
			}
		},
	},
});



export default authClient;
