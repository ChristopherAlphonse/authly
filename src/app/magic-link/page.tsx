"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

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
			setError((err as Error).message);
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
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<p className="text-zinc-400 text-center">
									We&apos;ve sent a magic link to {email}
								</p>
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
			<div className="w-full max-w-md space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-white">
						Passwordless sign in
					</h1>
					<p className="text-zinc-400">
						Getting tired of remembering passwords? Sign in with just your email — we&apos;ll send a magic link.
					</p>
				</div>
				<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
					<CardHeader className="text-center">

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
							<div className="flex justify-between items-center">
								<Link
									href="/login"
									className="text-sm text-zinc-400 hover:text-white hover:underline"
								>
									Sign in with password
								</Link>
								<Link
									href="/forgot-password"
									className="text-sm text-zinc-400 hover:text-white hover:underline"
								>
									Forgot password?
								</Link>
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

						{/* intentional: password-based flows removed on this branch (passwordless by default) */}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

