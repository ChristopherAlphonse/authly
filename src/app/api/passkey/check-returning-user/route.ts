import { NextRequest, NextResponse } from "next/server";
import { passkey, session, user } from "@/db/schema";

import { cookies } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";

type RateInfo = { count: number; windowStart: number };
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateMap = new Map<string, RateInfo>();

function getClientIp(request: Request): string {
	const xf = request.headers.get("x-forwarded-for");
	if (xf) return xf.split(",")[0].trim();
	const xr = request.headers.get("x-real-ip");
	if (xr) return xr;
	return "unknown";
}

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const info = rateMap.get(ip);
	if (!info) {
		rateMap.set(ip, { count: 1, windowStart: now });
		return true;
	}
	if (now - info.windowStart > RATE_LIMIT_WINDOW_MS) {
		rateMap.set(ip, { count: 1, windowStart: now });
		return true;
	}
	if (info.count >= RATE_LIMIT_MAX) return false;
	info.count += 1;
	return true;
}

/**
 * Securely checks if a returning user has passkeys enabled.
 * Uses the session cookie to identify the user, making it secure.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const ip = getClientIp(request);
		if (!checkRateLimit(ip)) {
			console.warn(`/api/passkey/check-returning-user rate limit exceeded for ${ip}`);
			return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
		}


		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("__Secure-session")?.value;

		if (!sessionCookie) {
			// No session cookie - user hasn't logged in recently
			return NextResponse.json({
				hasPasskey: false,
				isReturningUser: false,
				user: null
			});
		}

		// Find the session in the database
		// Better Auth might use session.id or session.token as the cookie value
		// Try both to be safe
		const [sessionRecord] = await db
			.select()
			.from(session)
			.where(
				eq(session.id, sessionCookie)
			)
			.limit(1);
// If not found by ID, try by token
		let foundSession = sessionRecord;
		if (!foundSession) {
			const [tokenSession] = await db
				.select()
				.from(session)
				.where(eq(session.token, sessionCookie))
				.limit(1);
			foundSession = tokenSession;
		}

		if (!foundSession) {

			return NextResponse.json({
				hasPasskey: false,
				isReturningUser: false,
				user: null
			});
		}


		const now = new Date();
		if (foundSession.expiresAt < now) {

			return NextResponse.json({
				hasPasskey: false,
				isReturningUser: false,
				user: null
			});
		}


		const userId = foundSession.userId;

		const passkeys = await db
			.select({ userId: passkey.userId })
			.from(passkey)
			.where(eq(passkey.userId, userId))
			.limit(1);

		const hasPasskey = passkeys.length > 0;

		// Get user info
		const [userRecord] = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		return NextResponse.json({
			hasPasskey,
			isReturningUser: true,
			user: userRecord ? {
				id: userRecord.id,
				email: userRecord.email,
				name: userRecord.name,
			} : null,
		});
	} catch (err) {
		console.error("/api/passkey/check-returning-user error", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export function POST() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

