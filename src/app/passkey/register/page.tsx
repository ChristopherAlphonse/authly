"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

	return rawMsg ?? "Failed to register passkey. Please try again.";
}

export default function PasskeyRegisterPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [checkingAuth, setCheckingAuth] = useState(true);
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			setCheckingAuth(false);
			if (!session) {
				// User must be authenticated to add a passkey
				setError("You must be signed in to register a passkey.");
			}
		}
	}, [session, isPending]);

	const handleRegister = async () => {
		if (!session) {
			setError("You must be signed in to register a passkey.");
			router.push("/login");
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Better Auth passkey registration
			// Note: User must be authenticated to add a passkey
			const result = await authClient.passkey.addPasskey();

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

			// If we get here, registration failed
			setError(uiMessageFromError(result as unknown));
		} catch (err: unknown) {
			console.error("[Passkey Register] Error:", err);
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
							Register Passkey
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Create a passkey for passwordless authentication
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{checkingAuth ? (
								<div className="text-zinc-400 text-sm text-center">
									Checking authentication...
								</div>
							) : (
								<>
									<p className="text-zinc-300 text-sm text-center">
										Passkeys allow you to sign in securely using your device&apos;s
										biometric authentication or a security key. You won&apos;t need a
										password.
									</p>
									{error && (
										<div className="text-red-400 text-sm text-center">{error}</div>
									)}
									<Button
										type="button"
										onClick={handleRegister}
										disabled={loading || !session}
										className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
									>
										{loading ? "Registering..." : "Register Passkey"}
									</Button>
								</>
							)}
						</div>

						<div className="mt-6 text-center">
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

