import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Conservative bot/robot/AI client blocking for API routes.
// This middleware applies only to paths under /api.

// NOTE: This is a heuristic-based, best-effort approach. It intentionally
// errs on the side of blocking suspicious clients. For production, use a
// robust WAF, distributed rate limiter, and allow-list for trusted clients.

const BOT_UA_PATTERNS = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpclient/i,
  /okhttp/i,
  /node-fetch/i,
  /postman/i,
  /libwww-perl/i,
  /java\//i,
  /scrapy/i,
  /puppeteer/i,
  /playwright/i,
  /headless/i,
];

// Very small in-memory rate map: ip -> {count, windowStart}
// This is per-process and ephemeral (not suitable for multi-instance production).
const RATE_LIMIT_WINDOW_MS = 10_000; // 10s
const RATE_LIMIT_MAX = 20; // max requests per window per IP
const rateMap = new Map<string, { count: number; windowStart: number }>();

function isLikelyBot(ua: string | null) {
  if (!ua) return true; // missing UA is suspicious
  for (const re of BOT_UA_PATTERNS) {
    if (re.test(ua)) return true;
  }
  // suspiciously short or generic UA
  if (ua.length < 10) return true;
  return false;
}

function checkRate(ip: string) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry) {
    rateMap.set(ip, { count: 1, windowStart: now });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // reset window
    rateMap.set(ip, { count: 1, windowStart: now });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) return { ok: false, remaining: 0 };
  return { ok: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /api/* routes
  if (!pathname.startsWith('/api')) return NextResponse.next();

  const ua = req.headers.get('user-agent');
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Block likely bots/AI clients
  if (isLikelyBot(ua)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Basic per-IP rate limiting
  const rate = checkRate(ip);
  if (!rate.ok) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Allow the request
  const res = NextResponse.next();
  // Expose some simple rate headers for debugging/clients
  res.headers.set('x-ratelimit-remaining', String(rate.remaining));
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
