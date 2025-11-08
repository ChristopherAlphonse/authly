import { jwtClient, magicLinkClient, passkeyClient } from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";
import { TRUSTED_ORIGINS } from "./utils";

const getBaseURL = () => {
	if (typeof window !== "undefined") {

		const isLocalhost = window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1" ||
			window.location.hostname === "";

		if (isLocalhost) {

			return "";
		}


		const firstValidOrigin = TRUSTED_ORIGINS.find((origin) => origin && origin.trim() !== "" && origin !== "undefined");
		if (firstValidOrigin) {
			return firstValidOrigin.replace(/\/+$/, "");
		}


		return `${window.location.protocol}//${window.location.host}`;
	}

	const firstValidOrigin = TRUSTED_ORIGINS.find((origin) => origin && origin.trim() !== "" && origin !== "undefined");
	if (firstValidOrigin) {
		return firstValidOrigin.replace(/\/+$/, "");
	}

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
