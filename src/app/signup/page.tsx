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

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await authClient.signUp.email({
				email,
				password,
				name,
			});
			// Redirect to dashboard or login page
			window.location.href = "/login";
		} catch {
			setError("Failed to create account. Please try again.");
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
							Create Account
						</CardTitle>
						<CardDescription className="text-zinc-400">
							Enter your information to create your account
						</CardDescription>
					</CardHeader>
					<CardContent>
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

							<div className="mt-6 grid grid-cols-2 gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (typeof window !== "undefined") {
											const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "authly-default";
											const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
											const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/cognito`);
											window.location.href = `https://${cognitoDomain}.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${redirectUri}&identity_provider=GitHub`;
										}
									}}
									className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
								>
									<svg
										className="w-4 h-4 mr-2"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
									GitHub
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (typeof window !== "undefined") {
											const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "authly-default";
											const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
											const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/cognito`);
											window.location.href = `https://${cognitoDomain}.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${redirectUri}&identity_provider=Google`;
										}
									}}
									className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
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
								Already have an account?{" "}
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
