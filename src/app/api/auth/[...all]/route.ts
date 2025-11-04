import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const { POST: basePOST, GET: baseGET } = toNextJsHandler(auth);


const normalizeOrigin = (o: string | null | undefined) =>
	typeof o === "string" && o.length ? o.replace(/\/+$|\s+/g, "") : o;

const getAllowedOrigins = () =>
	[
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		process.env.BETTER_AUTH_URL,
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	]
		.filter(Boolean)
		.map((s) => normalizeOrigin(s as string) as string);


const isAllowedOrigin = (origin: string | null): boolean => {
	if (!origin) return false;
	const normalized = normalizeOrigin(origin) as string;
	const allowedOrigins = getAllowedOrigins();
	return allowedOrigins.some((allowed) => allowed === normalized);
};


const addCorsHeaders = (
	response: Response,
	origin: string | null,
): Response => {
	const headers = new Headers(response.headers);

	if (origin && isAllowedOrigin(origin)) {
		headers.set("Access-Control-Allow-Origin", origin);
		headers.set("Access-Control-Allow-Credentials", "true");
	} else {
		headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
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
	const allowedOrigin =
		origin && isAllowedOrigin(origin) ? origin : "http://localhost:5173";

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
		// Read the body once so we can validate requested social provider
		// before forwarding to the base handler. We create a new Request
		// to pass to the underlying Better Auth handler because `request.text()`
		// consumes the body stream.
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
			if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) p.push("github");
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
			) as NextResponse;
		}

		const forwardRequest = new Request(request.url, {
			method: request.method,
			headers: request.headers as HeadersInit,
			body: bodyText,
		});

		const response = await basePOST(forwardRequest);
		return addCorsHeaders(response, origin) as NextResponse;
	} catch (error) {
		console.error("Better Auth POST error:", error);
		const origin = request.headers.get("origin");
		return addCorsHeaders(
			new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
			origin,
		) as NextResponse;
	}
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const origin = request.headers.get("origin");
		const response = await baseGET(request);
		return addCorsHeaders(response, origin) as NextResponse;
	} catch (error) {
		console.error("Better Auth GET error:", error);
		const origin = request.headers.get("origin");
		return addCorsHeaders(
			new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}),
			origin,
		) as NextResponse;
	}
}
