import { NextRequest, NextResponse } from "next/server";

// Cache for IP geo data - IP address -> { data, timestamp }
interface CacheEntry {
	data: {
		ip: string;
		state: string | null;
		city: string | null;
		region: string | null;
		country_name: string | null;
		rateLimited?: boolean;
		error?: string;
		message?: string;
	};
	timestamp: number;
}

const ipCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for successful responses
const ERROR_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour for errors/rate limits

// Clean up expired cache entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [ip, entry] of ipCache.entries()) {
		if (now - entry.timestamp > CACHE_TTL_MS) {
			ipCache.delete(ip);
		}
	}
}, 60 * 60 * 1000); // Clean up every hour

export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		let ipAddress = searchParams.get("ip");

		console.log("[IP API] Request received, IP param:", ipAddress);

		// Helper to check if IP is localhost
		const isLocalhost = (ip: string | null): boolean => {
			if (!ip) return true;
			const normalized = ip.toLowerCase().trim();
			return normalized === "127.0.0.1" ||
				normalized === "::1" ||
				normalized === "localhost" ||
				normalized === "unknown";
		};

		// Step 1: Get IP address if not provided OR if it's localhost
		if (!ipAddress || isLocalhost(ipAddress)) {
			if (isLocalhost(ipAddress)) {
				console.log("[IP API] Localhost detected, fetching real IP from ipify...");
			} else {
				console.log("[IP API] No IP provided, fetching from ipify...");
			}
			try {
				const ipResponse = await fetch("https://api.ipify.org", {
					signal: AbortSignal.timeout(5000), // 5 second timeout
				});
				if (!ipResponse.ok) {
					throw new Error(`ipify returned status ${ipResponse.status}`);
				}
				ipAddress = (await ipResponse.text()).trim();
				console.log("[IP API] Fetched IP from ipify:", ipAddress);

				// Double-check: if ipify returns localhost (shouldn't happen), try again
				if (isLocalhost(ipAddress)) {
					console.warn("[IP API] ipify returned localhost, fetching again...");
					const retryResponse = await fetch("https://api.ipify.org", {
						signal: AbortSignal.timeout(5000),
					});
					if (retryResponse.ok) {
						ipAddress = (await retryResponse.text()).trim();
						console.log("[IP API] Fetched IP from ipify (retry):", ipAddress);
					}
				}
			} catch (ipifyError) {
				console.error("[IP API] Failed to fetch IP from ipify:", ipifyError);
				throw new Error(`Failed to get IP address: ${ipifyError instanceof Error ? ipifyError.message : String(ipifyError)}`);
			}
		} else {
			console.log("[IP API] Using provided IP:", ipAddress);
		}

		// Final check: NEVER use localhost
		if (isLocalhost(ipAddress)) {
			console.error("[IP API] ERROR: Still localhost after all attempts");
			throw new Error("Unable to determine real IP address - localhost detected");
		}

		// Step 2: Check cache first
		const cacheKey = ipAddress;
		const cached = ipCache.get(cacheKey);
		const now = Date.now();

		if (cached) {
			// Use shorter TTL for errors/rate-limited responses
			const ttl = (cached.data.rateLimited || cached.data.error) ? ERROR_CACHE_TTL_MS : CACHE_TTL_MS;
			const age = now - cached.timestamp;

			if (age < ttl) {
				console.log(`[IP API] Cache HIT for IP: ${ipAddress} (age: ${Math.round(age / 1000)}s)`);
				return NextResponse.json(cached.data);
			}

			console.log(`[IP API] Cache EXPIRED for IP: ${ipAddress} (age: ${Math.round(age / 1000)}s), fetching fresh data`);
			ipCache.delete(cacheKey);
		} else {
			console.log(`[IP API] Cache MISS for IP: ${ipAddress}`);
		}

		// Step 3: Fetch geo information
		console.log(`[IP API] Fetching geo info for IP: ${ipAddress}`);
		const geoUrl = `https://ipapi.co/${ipAddress}/json/`;
		console.log(`[IP API] Calling: ${geoUrl}`);

		let response: Response;
		try {
			response = await fetch(geoUrl, {
				signal: AbortSignal.timeout(10000), // 10 second timeout
			});
		} catch (fetchError) {
			console.error("[IP API] Fetch error:", fetchError);
			throw new Error(`Network error fetching geo info: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
		}

		console.log(`[IP API] Geo API response status: ${response.status}`);

		// Handle rate limiting (429) - return IP at least (but NEVER localhost)
		if (response.status === 429) {
			console.warn("[IP API] Rate limited by ipapi.co, returning IP only");
			// Final validation: NEVER return localhost
			if (isLocalhost(ipAddress)) {
				console.error("[IP API] ERROR: Attempted to return localhost when rate limited");
				throw new Error("Unable to determine real IP address - rate limited and localhost detected");
			}
			const rateLimitedResult = {
				ip: ipAddress,
				state: null,
				city: null,
				region: null,
				country_name: null,
				rateLimited: true,
				message: "Geo information temporarily unavailable due to rate limiting"
			};
			// Cache rate-limited responses for shorter time (1 hour) to retry sooner
			ipCache.set(cacheKey, { data: rateLimitedResult, timestamp: now });
			return NextResponse.json(rateLimitedResult);
		}

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[IP API] Geo API error response: ${errorText}`);
			// Still return the IP address even if geo lookup fails
			const errorResult = {
				ip: ipAddress,
				state: null,
				city: null,
				region: null,
				country_name: null,
				error: `Geo lookup failed: ${response.status}`,
				message: "IP address retrieved but geo information unavailable"
			};
			// Cache error responses for shorter time (1 hour) to retry sooner
			ipCache.set(cacheKey, { data: errorResult, timestamp: now });
			return NextResponse.json(errorResult);
		}

		const geoInfo = await response.json();
		console.log("[IP API] Geo Info payload data:", JSON.stringify(geoInfo, null, 2));

		if (geoInfo.error) {
			console.error("[IP API] Geo API returned error:", geoInfo.reason || geoInfo.error);
			// Still return the IP address
			const errorResult = {
				ip: ipAddress,
				state: null,
				city: null,
				region: null,
				country_name: null,
				error: geoInfo.reason || geoInfo.error || "Unknown error from geo API",
				message: "IP address retrieved but geo information unavailable"
			};
			// Cache error responses for shorter time (1 hour) to retry sooner
			ipCache.set(cacheKey, { data: errorResult, timestamp: now });
			return NextResponse.json(errorResult);
		}

		// Step 4: Return the data and cache it
		const result = {
			ip: ipAddress,
			state: geoInfo.region || null,
			city: geoInfo.city || null,
			region: geoInfo.region_code || geoInfo.region || null,
			country_name: geoInfo.country_name || null
		};
		console.log("[IP API] Returning result:", JSON.stringify(result, null, 2));

		// Cache successful responses for 24 hours
		ipCache.set(cacheKey, { data: result, timestamp: now });
		console.log(`[IP API] Cached result for IP: ${ipAddress}`);

		return NextResponse.json(result);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error("[IP API] Error fetching geo info:", errorMessage);
		if (errorStack) {
			console.error("[IP API] Error stack:", errorStack);
		}
		return NextResponse.json(
			{ error: `Failed to fetch geo information: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
