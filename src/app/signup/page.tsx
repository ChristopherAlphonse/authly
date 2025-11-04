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

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [signupSuccess, setSignupSuccess] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState("");

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSignupSuccess(false);

		try {
			await authClient.signUp.email({
				email,
				password,
				name,
			});
			setSignupSuccess(true);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to create account. Please try again.";
			setError(errorMessage);
			setSignupSuccess(false);
		} finally {
			setLoading(false);
		}
	};

	const handleResendVerification = async (): Promise<void> => {
		if (!email) {
			setResendError("Email address is required");
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
							Create Account
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your information to create your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						{signupSuccess ? (
							<div className="space-y-4">
								<div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
									<p className="text-blue-300 text-sm text-center mb-2">
										Account created successfully!
									</p>
									<p className="text-zinc-300 text-sm text-center">
										We&apos;ve sent a verification email to{" "}
										<span className="font-semibold text-white">{email}</span>.
										Please check your inbox and click the verification link to
										activate your account.
									</p>
								</div>

								{resendSuccess && (
									<div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
										<p className="text-green-400 text-sm text-center">
											Verification email sent! Please check your inbox.
										</p>
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
									disabled={resendLoading}
									className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
								>
									{resendLoading
										? "Sending..."
										: "Resend Verification Email"}
								</Button>

								<div className="text-center space-y-2">
									<Link
										href="/login"
										className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium"
									>
										Continue to sign in
									</Link>
									<p className="text-zinc-400 text-xs">
										Once your email is verified, you can sign in
									</p>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Input
										type="text"
										placeholder="Full Name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-zinc-600 focus:ring-zinc-600"
									/>
								</div>
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
								{error && (
									<div className="text-red-400 text-sm text-center">{error}</div>
								)}
								<Button
									type="submit"
									disabled={loading}
									className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
								>
									{loading ? "Creating Account..." : "Create Account"}
								</Button>
							</form>
						)}

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

							<div className="mt-6">
								<Button
									type="button"
									variant="outline"
									onClick={async () => {
										try {
											await authClient.signIn.social({
												provider: "google",
												callbackURL: "/",
											});
										} catch (err: unknown) {
											setError(
												typeof err === "string"
													? err
													: err instanceof Error
														? err.message
														: "Failed to sign in with Google",
											);
										}
									}}
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

						<div className="mt-6 text-center space-y-2">
							<p className="text-zinc-400 text-sm">
								Already have an account?{" "}
								<Link
									href="/login"
									className="text-white hover:underline font-medium"
								>
									Sign in
								</Link>
							</p>
							<p className="text-zinc-400 text-xs">
								After signing up, you can{" "}
								<Link
									href="/passkey/register"
									className="text-white hover:underline font-medium"
								>
									register a passkey
								</Link>
								{" "}for passwordless authentication
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
