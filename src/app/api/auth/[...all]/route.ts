import type { NextRequest, NextResponse } from "next/server";

import { TRUSTED_ORIGINS } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { POST: basePOST, GET: baseGET } = toNextJsHandler(auth);

const normalizeOrigin = (o: string | null | undefined) =>
	typeof o === "string" && o.length ? o.replace(/\/+$|\s+/g, "") : o;

const getAllowedOrigins = () => {
	return TRUSTED_ORIGINS.map((s) => normalizeOrigin(s) as string);
};


const isAllowedOrigin = (origin: string | null): boolean => {
	if (!origin) return false;
	const normalized = normalizeOrigin(origin) as string;
	const allowedOrigins = getAllowedOrigins();
	return allowedOrigins.some((allowed) => allowed === normalized);
};

const getDefaultOrigin = (): string => {
	if (TRUSTED_ORIGINS.length > 0) {
		return normalizeOrigin(TRUSTED_ORIGINS[0]) as string;
	}
	return "http://localhost:5173";
};

const addCorsHeaders = (
	response: Response,
	origin: string | null,
	requestUrl?: string,
): Response => {
	const headers = new Headers(response.headers);
	if (origin && isAllowedOrigin(origin)) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Credentials", "true");
	} else if (!origin) {

		if (requestUrl) {
			try {
				const url = new URL(requestUrl);
				const inferredOrigin = `${url.protocol}//${url.host}`;

				headers.set("Access-Control-Allow-Origin", inferredOrigin);
			} catch {
				headers.set("Access-Control-Allow-Origin", getDefaultOrigin());
			}
		} else {
			headers.set("Access-Control-Allow-Origin", getDefaultOrigin());
		}
		headers.set("Access-Control-Allow-Credentials", "true");
	} else {

		headers.set("Access-Control-Allow-Origin", getDefaultOrigin());
		headers.set("Access-Control-Allow-Credentials", "true");
	}

	headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, DELETE, PATCH",
	);
	headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Requested-With",
	);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
};


export async function OPTIONS(request: NextRequest) {
	const origin = request.headers.get("origin");
	let allowedOrigin: string;

	if (origin && isAllowedOrigin(origin)) {
		allowedOrigin = origin;
	} else if (!origin) {

		try {
			const url = new URL(request.url);
			allowedOrigin = `${url.protocol}//${url.host}`;
		} catch {
			allowedOrigin = getDefaultOrigin();
		}
	} else {

		allowedOrigin = getDefaultOrigin();
	}

	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": allowedOrigin,
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
			"Access-Control-Allow-Headers":
				"Content-Type, Authorization, X-Requested-With",
			"Access-Control-Allow-Credentials": "true",
		},
	});
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const origin = request.headers.get("origin");
		const requestUrl = new URL(request.url);
		console.log("[Better Auth] POST request to:", requestUrl.pathname);
		console.log("[Better Auth] Full URL:", requestUrl.toString());

		const bodyText = await request.text();
		let parsedBody: Record<string, unknown> | null = null;
		try {
			parsedBody = bodyText ? JSON.parse(bodyText) as Record<string, unknown> : null;
		} catch {
			// Not JSON — fine, leave parsedBody null
		}

		const getRegisteredProviders = () => {
			const p: string[] = [];
			if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) p.push("google");
			if (
				process.env.COGNITO_CLIENT_ID &&
				process.env.COGNITO_CLIENT_SECRET &&
				process.env.COGNITO_DOMAIN &&
				process.env.COGNITO_USER_POOL_ID
			)
				p.push("cognito");
			return p;
		};

		const requestedProvider = parsedBody?.provider && typeof parsedBody.provider === "string"
			? parsedBody.provider
			: null;
		const registered = getRegisteredProviders();
		if (requestedProvider && !registered.includes(requestedProvider)) {
			console.warn("Requested social provider not configured:", requestedProvider, "available:", registered);
			return addCorsHeaders(
				new Response(JSON.stringify({ error: "Provider not configured", provider: requestedProvider, available: registered }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				}),
				origin,
				request.url,
			) as NextResponse;
		}

		const forwardRequest = new Request(request.url, {
			method: request.method,
			headers: request.headers as HeadersInit,
			body: bodyText,
		});

		const response = await basePOST(forwardRequest);
		console.log("[Better Auth] Response status:", response.status);
		console.log("[Better Auth] Response statusText:", response.statusText);


		const clonedResponse = response.clone();
		const responseText = await clonedResponse.text();
		console.log("[Better Auth] Response body:", responseText);

		return addCorsHeaders(response, origin, request.url) as NextResponse;
	} catch (error) {
		console.error("Better Auth POST error:", error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error("Error details:", {
			message: errorMessage,
			stack: errorStack,
			url: request.url,
		});
		const origin = request.headers.get("origin");
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "Internal server error",
					message: process.env.NODE_ENV === "development" ? errorMessage : undefined,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			),
			origin,
			request.url,
		) as NextResponse;
	}
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const origin = request.headers.get("origin");
		const response = await baseGET(request);
		return addCorsHeaders(response, origin, request.url) as NextResponse;
	} catch (error) {
		console.error("Better Auth GET error:", error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error("Error details:", {
			message: errorMessage,
			stack: errorStack,
			url: request.url,
		});
		const origin = request.headers.get("origin");
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "Internal server error",
					message: process.env.NODE_ENV === "development" ? errorMessage : undefined,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			),
			origin,
			request.url,
		) as NextResponse;
	}
}
