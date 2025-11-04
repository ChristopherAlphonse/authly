"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function AuthStatus() {
	const { data: session, isPending } = authClient.useSession();

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.reload();
	};

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader className="px-4 sm:px-6">
				<CardTitle className="text-white text-lg sm:text-xl">
					Better-Auth Status
				</CardTitle>
				<CardDescription className="text-zinc-400 text-sm">
					{isPending
						? "Checking authentication..."
						: session
							? "You are signed in"
							: "You are not signed in"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
				{isPending ? (
					<div className="text-zinc-400">Loading...</div>
				) : session ? (
					<div className="space-y-4">
						<div className="p-3 sm:p-4 bg-zinc-800 rounded-lg">
							<h3 className="font-semibold text-white mb-2 text-sm sm:text-base">
								User Info
							</h3>
							<p className="text-zinc-300 text-xs sm:text-sm break-words">
								Email: {session.user.email}
							</p>
							<p className="text-zinc-300 text-xs sm:text-sm break-words">
								Name: {session.user.name}
							</p>
							<p className="text-zinc-300 text-xs sm:text-sm break-all">
								ID: {session.user.id}
							</p>
						</div>
						<Link href="/passkey/register" className="block">
							<Button
								type="button"
								variant="outline"
								className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-sm sm:text-base"
							>
								Register Passkey
							</Button>
						</Link>
						<Button
							type="button"
							onClick={handleSignOut}
							variant="outline"
							className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-sm sm:text-base"
						>
							Sign Out
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						<Link href="/login" className="block">
							<Button
								type="button"
								className="w-full bg-white text-zinc-900 hover:bg-zinc-100 text-sm sm:text-base"
							>
								Sign In
							</Button>
						</Link>
						<Link href="/signup" className="block">
							<Button
								type="button"
								variant="outline"
								className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-sm sm:text-base"
							>
								Create Account
							</Button>
						</Link>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
