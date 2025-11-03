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

export default function ForgotPasswordPage() {
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
			await authClient.forgetPassword({
				email,
				redirectTo: `${window.location.origin}/reset-password`,
			});

			setSuccess(true);
		} catch (err: unknown) {
			console.error("[Forgot Password] Error:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to send password reset email. Please try again.",
			);
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
								Check Your Email
							</CardTitle>
							<CardDescription className="text-zinc-400">
								We&apos;ve sent a password reset link to {email}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-zinc-300 text-sm mb-6">
								Click the link in the email to reset your password. If you
								don&apos;t see it, check your spam folder.
							</p>
							<Link href="/login">
								<Button
									type="button"
									className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
								>
									Back to Sign In
								</Button>
							</Link>
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
							Forgot Password
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your email address and we&apos;ll send you a link to reset
							your password
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
								{loading ? "Sending..." : "Send Reset Link"}
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
