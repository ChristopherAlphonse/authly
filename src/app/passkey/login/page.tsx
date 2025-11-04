"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

function uiMessageFromError(err: unknown): string {
	let rawMsg: string | undefined;

	if (typeof err === "string") rawMsg = err;
	else if (typeof err === "object" && err !== null) {
		const maybe = err as { [k: string]: unknown };
		if (typeof maybe.message === "string") rawMsg = maybe.message;
		else {
			const resp = maybe.response;
			if (typeof resp === "object" && resp !== null) {
				const r = resp as { [k: string]: unknown };
				const data = r.data;
				if (typeof data === "object" && data !== null) {
					const d = data as { [k: string]: unknown };
					if (typeof d.message === "string") rawMsg = d.message;
				}
			}
		}
	}

	return rawMsg ?? "Failed to sign in with passkey. Please try again.";
}

export default function PasskeyLoginPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSignIn = async () => {
		setLoading(true);
		setError("");

		try {
			// Better Auth passkey sign-in
			const result = await authClient.signIn.passkey();

			if (result && typeof result === "object") {
				const r = result as { [k: string]: unknown };
				if (r.user || r.session || r.data) {
					// Success! Redirect to home
					router.push("/");
					return;
				}
				if (r.error) {
					setError(uiMessageFromError(r.error));
					return;
				}
			}

			// If we get here, sign-in failed
			setError(uiMessageFromError(result as unknown));
		} catch (err: unknown) {
			console.error("[Passkey Login] Error:", err);
			setError(uiMessageFromError(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-white">
							Sign In with Passkey
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Use your device&apos;s biometric authentication or security key
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-zinc-300 text-sm text-center">
								Use your registered passkey to sign in. You&apos;ll be prompted
								to authenticate using your device&apos;s biometric or security
								key.
							</p>
							{error && (
								<div className="text-red-400 text-sm text-center">{error}</div>
							)}
							<Button
								type="button"
								onClick={handleSignIn}
								disabled={loading}
								className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
							>
								{loading ? "Signing In..." : "Sign In with Passkey"}
							</Button>
						</div>

						<div className="mt-6 text-center space-y-2">
							<p className="text-zinc-400 text-sm">
								Don&apos;t have a passkey?{" "}
								<Link
									href="/passkey/register"
									className="text-white hover:underline font-medium"
								>
									Register one
								</Link>
							</p>
							<p className="text-zinc-400 text-sm">
								<Link
									href="/login"
									className="text-white hover:underline font-medium"
								>
									Back to login
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

