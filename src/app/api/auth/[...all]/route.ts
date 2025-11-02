import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import type { NextRequest, NextResponse } from "next/server";

const { POST: basePOST, GET: baseGET } = toNextJsHandler(auth);

// Allowed origins for CORS
const getAllowedOrigins = () => [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	process.env.BETTER_AUTH_URL,
	process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
].filter(Boolean);

// Check if origin is allowed
const isAllowedOrigin = (origin: string | null): boolean => {
	if (!origin) return false;
	const allowedOrigins = getAllowedOrigins();
	return allowedOrigins.some((allowed) => origin === allowed);
};

// Add CORS headers to response
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

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
	const origin = request.headers.get("origin");
	const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : "http://localhost:5173";

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

// Wrap handlers to add CORS headers
export async function POST(
	request: NextRequest,
): Promise<NextResponse> {
	const origin = request.headers.get("origin");
	const response = await basePOST(request);
	return addCorsHeaders(response, origin) as NextResponse;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const origin = request.headers.get("origin");
	const response = await baseGET(request);
	return addCorsHeaders(response, origin) as NextResponse;
}
