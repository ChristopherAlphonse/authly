import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/email/aws-ses";

// Dev-only test endpoint to send a verification-style email using SES helper.
// Protect so it cannot be used in production.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const to = typeof body?.to === "string" ? body.to : null;

    if (!to) {
      return NextResponse.json({ error: "Missing 'to' in request body" }, { status: 400 });
    }

    // Simple dev verification URL — this doesn't create a real verification token,
    // it's only to test SES sending and the email template.
    const verifyUrl = `http://localhost:5173/dev/verify?email=${encodeURIComponent(to)}`;

    await sendVerificationEmail(to, verifyUrl, to);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Dev test email send failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ info: "POST { to: string } to send test verification email (dev only)" });
}
