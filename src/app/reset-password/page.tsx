"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	const token = searchParams.get("token");
	const errorParam = searchParams.get("error");

	useEffect(() => {
		if (errorParam) {
			setError("Invalid or expired reset token. Please request a new one.");
		}
		if (!token && !errorParam) {
			setError("Missing reset token. Please check your email link.");
		}
	}, [token, errorParam]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setLoading(false);
			return;
		}

		if (!token) {
			setError("Missing reset token");
			setLoading(false);
			return;
		}

		try {
			await authClient.resetPassword({
				token,
				newPassword: password,
			});

			setSuccess(true);
			// Redirect to login after 2 seconds
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err: unknown) {
			console.error("[Reset Password] Error:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to reset password. The link may have expired. Please request a new one.",
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
								Password Reset Successfully
							</CardTitle>
							<CardDescription className="text-zinc-400">
								Your password has been reset. Redirecting to sign in...
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/login">
								<Button
									type="button"
									className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
								>
									Go to Sign In
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
							Reset Password
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your new password below
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Input
									type="password"
									placeholder="New Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							<div className="space-y-2">
								<Input
									type="password"
									placeholder="Confirm New Password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={8}
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							{error && (
								<div className="text-red-400 text-sm text-center">{error}</div>
							)}
							<Button
								type="submit"
								disabled={loading || !token}
								className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
							>
								{loading ? "Resetting Password..." : "Reset Password"}
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

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
					<div className="w-full max-w-md">
						<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
							<CardHeader className="text-center">
								<CardTitle className="text-2xl font-bold text-white">
									Loading...
								</CardTitle>
							</CardHeader>
						</Card>
					</div>
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
