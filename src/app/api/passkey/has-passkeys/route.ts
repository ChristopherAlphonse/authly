import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { passkey, user } from "@/db/schema";


type RateInfo = { count: number; windowStart: number };
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateMap = new Map<string, RateInfo>();

function getClientIp(request: Request) {

	const xf = request.headers.get("x-forwarded-for");
	if (xf) return xf.split(",")[0].trim();
	const xr = request.headers.get("x-real-ip");
	if (xr) return xr;
	return "unknown";
}

function checkRateLimit(ip: string) {
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


export async function POST(request: Request) {
	try {
		const ip = getClientIp(request);
		if (!checkRateLimit(ip)) {
			console.warn(`/api/passkey/has-passkeys rate limit exceeded for ${ip}`);
			return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
		}

		const contentType = request.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) {
			return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
		}

		const body = await request.json().catch(() => null);
		if (!body || typeof body !== "object") {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}

		const emailRaw = typeof body.email === "string" ? body.email.trim() : null;
		const adminToken = typeof body.adminToken === "string" ? body.adminToken : null;
		const expected = process.env.PASSKEY_ADMIN_TOKEN || null;

		console.info(`/api/passkey/has-passkeys request from ${ip}`, {
			emailProvided: !!emailRaw,
			adminTokenProvided: !!adminToken,
		});

		if (emailRaw) {
			if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRaw)) {
				return NextResponse.json({ error: "Invalid email" }, { status: 400 });
			}

			const [found] = await db
				.select({ id: user.id, name: user.name, email: user.email })
				.from(user)
				.where(eq(user.email, emailRaw))
				.limit(1);

			if (!found) {
				return NextResponse.json({ hasPasskey: false, user: null });
			}

			const count = await db
				.select({ userId: passkey.userId })
				.from(passkey)
				.where(eq(passkey.userId, found.id));

			return NextResponse.json({ hasPasskey: count.length > 0, user: found });
		}


		if (!adminToken || !expected || adminToken !== expected) {
			console.warn(`/api/passkey/has-passkeys unauthorized list attempt from ${ip}`);
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const usersWithPasskeys = await db
			.select({ id: user.id, name: user.name, email: user.email })
			.from(user)
			.where(
				inArray(user.id, db.select({ userId: passkey.userId }).from(passkey)),
			);

		return NextResponse.json({ users: usersWithPasskeys });
	} catch (err) {
		console.error("/api/passkey/has-passkeys error", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}


export function GET() {
	return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
