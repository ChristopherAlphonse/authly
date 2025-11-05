import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Authly",
	description: "Authly - Authentication demo with Better Auth and Drizzle",
	icons: {
		icon: [
			{ url: '/favicon_io/favicon.ico' },
			{ url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/authly_logo.png', sizes: 'any', type: 'image/png' },
		],
		shortcut: '/favicon_io/favicon.ico',
		apple: '/favicon_io/apple-touch-icon.png',
		other: [
			{ rel: 'manifest', url: '/favicon_io/site.webmanifest' },
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
