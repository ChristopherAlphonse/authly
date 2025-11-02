import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Prioritize localhost for local development, fallback to env var for production
const getBaseURL = () => {
	// In development (local), always use localhost
	if (typeof window !== "undefined") {
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			return "http://localhost:5173";
		}
	}
	// For production, use env var
	return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5173";
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [jwtClient()],
});

export default authClient;
