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
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showResendVerification, setShowResendVerification] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState("");

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError: (ctx) => {
					// Handle the error
					if (ctx.error.status === 403) {
						setError("Please verify your email address");
						setShowResendVerification(true);
					} else {
						// Show the original error message
						setError(
							ctx.error.message || "Sign in failed. Please try again.",
						);
						setShowResendVerification(false);
					}
					setLoading(false);
				},
			},
		);

		// Better Auth's signIn.email returns an object with user/session on success
		if (result && typeof result === "object") {
			const r = result as { [k: string]: unknown };
			// Sign-in succeeded if we have user or session
			if (r.user || r.session || r.data) {
				// Success! Redirect to home
				router.push("/");
				setLoading(false);
				return;
			}
		}

		// If we get here and no error was set in onError, something unexpected happened
		// This shouldn't happen if onError is called for all errors, but handle it just in case
		setLoading(false);
	};

	// Use Better Auth's social sign-in for direct Google OAuth
	const handleGoogleSignIn = async () => {
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (err: unknown) {
			let errorMessage = "Failed to sign in with Google. Please try again.";
			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === "object" && err !== null) {
				const errorObj = err as { error?: string; message?: string; provider?: string };
				if (errorObj.error === "Provider not configured") {
					errorMessage = "Google sign-in is not configured. Please contact support or use email/password.";
				} else if (errorObj.message) {
					errorMessage = errorObj.message;
				}
			}
			setError(errorMessage);
		}
	};

	// Handle passkey sign-in
	const handlePasskeySignIn = async () => {
		setLoading(true);
		setError("");

		try {
			const result = await authClient.signIn.passkey();

			if (result && typeof result === "object") {
				const r = result as { [k: string]: unknown };
				if (r.user || r.session || r.data) {

					router.push("/");
					return;
				}
				if (r.error) {
					setError(r.error instanceof Error ? r.error.message : "Failed to sign in with Passkey. Please try again.");
					return;
				}
			}

			setError("Failed to sign in with Passkey. Please try again.");
		} catch (error: unknown) {
			console.error("[Login] Passkey sign-in error:", error);
			setError((error as Error | undefined)?.message || "Failed to sign in with Passkey. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResendVerification = async (): Promise<void> => {
		if (!email) {
			setResendError("Please enter your email address");
			return;
		}

		setResendLoading(true);
		setResendError("");
		setResendSuccess(false);

		try {
			await authClient.sendVerificationEmail({
				email,
				callbackURL: "/",
			});
			setResendSuccess(true);
			setResendError("");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to send verification email. Please try again.";
			setResendError(errorMessage);
			setResendSuccess(false);
		} finally {
			setResendLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-white">
							Welcome Back
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Input
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										setShowResendVerification(false);
										setResendSuccess(false);
										setResendError("");
									}}
									required
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							<div className="space-y-2">
								<Input
									type="password"
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
								/>
							</div>
							<div className="text-right">
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
							{showResendVerification && (
								<div className="space-y-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
									<p className="text-zinc-300 text-sm text-center">
										Your email address needs to be verified before you can sign in.
									</p>
									{resendSuccess && (
										<div className="text-green-400 text-sm text-center">
											Verification email sent! Please check your inbox.
										</div>
									)}
									{resendError && (
										<div className="text-red-400 text-sm text-center">
											{resendError}
										</div>
									)}
									<Button
										type="button"
										onClick={handleResendVerification}
										disabled={resendLoading || loading}
										className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
									>
										{resendLoading
											? "Sending..."
											: "Resend Verification Email"}
									</Button>
									<div className="text-center">
										<Link
											href="/resend-verification"
											className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
										>
											Or use a different email address
										</Link>
									</div>
								</div>
							)}
							<Button
								type="submit"
								disabled={loading}
								className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
							>
								{loading ? "Signing In..." : "Sign In"}
							</Button>
						</form>

						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-zinc-700" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-zinc-900 px-2 text-zinc-400">
										Or continue with
									</span>
								</div>
							</div>

							<div className="mt-6 space-y-3">
								<Button
									type="button"
									variant="outline"
									onClick={handlePasskeySignIn}
									disabled={loading}
									className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
								>
									<svg
										className="w-4 h-4 mr-2"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
										<path d="M9 12l2 2 4-4" />
									</svg>
									{loading ? "Signing In..." : "Sign in with Passkey"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleGoogleSignIn}
									disabled={loading}
									className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
								>
									<svg
										className="w-4 h-4 mr-2"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Google
								</Button>
							</div>
						</div>

						<div className="mt-6 text-center">
							<p className="text-zinc-400 text-sm">
								Don&apos;t have an account?{" "}
								<Link
									href="/signup"
									className="text-white hover:underline font-medium"
								>
									Create one
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
