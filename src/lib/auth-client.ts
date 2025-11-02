import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
	if (typeof window !== "undefined") {
		return ""; // relative URLs => same origin (e.g. https://authly-red.vercel.app)
	}

	const envUrl =
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL;
	if (envUrl && typeof envUrl === "string") return envUrl.replace(/\/+$/, "");

	return "http://localhost:5173";
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [jwtClient()],
});

export default authClient;
