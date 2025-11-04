"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ResendVerificationPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			await authClient.sendVerificationEmail({
				email,
				callbackURL: "/",
			});
			setSuccess(true);
			setError("");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to send verification email. Please try again.";
			setError(errorMessage);
			setSuccess(false);
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
							Resend Verification Email
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your email address to receive a new verification email
						</CardDescription>
					</CardHeader>
					<CardContent>
						{success ? (
							<div className="space-y-4">
								<div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
									<p className="text-green-400 text-sm text-center">
										Verification email sent successfully! Please check your inbox
										and click the verification link to verify your email address.
									</p>
								</div>
								<div className="text-center space-y-2">
									<Link
										href="/login"
										className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium"
									>
										Return to sign in
									</Link>
								</div>
							</div>
						) : (
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
									{loading ? "Sending..." : "Send Verification Email"}
								</Button>
							</form>
						)}

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



