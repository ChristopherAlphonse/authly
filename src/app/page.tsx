import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

import { AuthStatus } from "@/components/auth-status";

export default async function Home() {
	return (
		<div className="min-h-screen bg-zinc-950 text-white">
			<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
							Authly
						</h1>
						<p className="text-zinc-400 text-sm sm:text-base md:text-lg px-2">
							Authentication demo with Better Auth and Drizzle
						</p>
					</div>

					<div className="grid gap-4 sm:gap-6">
						<AuthStatus />
					</div>

					<div className="mt-6 sm:mt-8 text-center">
						<Card className="bg-zinc-900 border-zinc-800">
							<CardHeader className="px-4 sm:px-6">
								<CardTitle className="text-white text-lg sm:text-xl">
									Quick Start
								</CardTitle>
								<CardDescription className="text-zinc-400 text-sm">
									Get started with authentication
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
								<div className="grid gap-4 sm:gap-6 md:grid-cols-3">
									<div className="text-center">
										<div className="text-2xl mb-2">🔐</div>
										<h3 className="font-semibold text-white text-sm sm:text-base">
											Sign Up
										</h3>
										<p className="text-zinc-400 text-xs sm:text-sm">
											Create a new account
										</p>
									</div>
									<div className="text-center">
											<Link href="/magic-link" className="block">
												<div className="text-2xl mb-2">🔑</div>
												<h3 className="font-semibold text-white text-sm sm:text-base">
													Magic Link
												</h3>
												<p className="text-zinc-400 text-xs sm:text-sm">
													Passwordless sign-in with just your email
												</p>
											</Link>
										</div>
									<div className="text-center">
										<div className="text-2xl mb-2">🚀</div>
										<h3 className="font-semibold text-white text-sm sm:text-base">
											Test API
										</h3>
										<p className="text-zinc-400 text-xs sm:text-sm">
											Verify your API
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
