"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

	return rawMsg ?? "Failed to send magic link. Please try again.";
}

export default function MagicLinkPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			await authClient.signIn.magicLink({
				email,
				callbackURL: `${window.location.origin}/`,
			});

			setSuccess(true);
		} catch (err: unknown) {
			console.error("[Magic Link] Error:", err);
			setError(uiMessageFromError(err));
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl font-bold text-white">
								Check your email
							</CardTitle>
							<CardDescription className="text-zinc-400">
								We&apos;ve sent a magic link to {email}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<p className="text-zinc-300 text-sm text-center">
									Click the link in the email to sign in. The link will expire
									in 10 minutes.
								</p>
								<div className="text-center">
									<Link
										href="/login"
										className="text-sm text-zinc-400 hover:text-white hover:underline"
									>
										Back to login
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-white">
							Magic Link
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your email and we&apos;ll send you a sign-in link
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Input
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							{error && (
								<div className="text-red-400 text-sm text-center">{error}</div>
							)}
							<Button
								type="submit"
								disabled={loading}
								className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
							>
								{loading ? "Sending..." : "Send Magic Link"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-zinc-400 text-sm">
								Remember your password?{" "}
								<Link
									href="/login"
									className="text-white hover:underline font-medium"
								>
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

