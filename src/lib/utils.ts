import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IS_CLOUD } from "../constants/auth_constant";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const TRUSTED_ORIGINS = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	"https://authly-red.vercel.app",
	...(process.env.VERCEL_URL
		? [`https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`]
		: []),
].filter((origin): origin is string => {
	return (
		typeof origin === "string" &&
		origin.trim() !== "" &&
		origin !== "undefined" &&
		origin !== "null"
	);
});

export const DEV_MODE = IS_CLOUD;



	export function formatExpiry(seconds: number): string {
		if (seconds < 60) return `${seconds} seconds`;
		if (seconds < 3600) {
			const m = Math.round(seconds / 60);
			return `${m} minute${m === 1 ? "" : "s"}`;
		}
		const h = Math.round((seconds / 3600) * 10) / 10;
		if (Number.isInteger(h)) return `${h} hour${h === 1 ? "" : "s"}`;
		return `${h} hours`;
	}
