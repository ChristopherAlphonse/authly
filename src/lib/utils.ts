import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IS_CLOUD } from "../constants/auth_constant";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const DEV_MODE = IS_CLOUD;

export const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED
	? process.env.TELEMETRY_ENABLED === 'true'
	: process.env.NODE_ENV === 'development';

    export const SESSION_EXPIRES_IN = 60 * 60 * 12;
export const SESSION_UPDATE_AGE = 60 * 60 * 2;


	export const RESET_PASSWORD_EXPIRES_IN = process.env.RESET_PASSWORD_EXPIRES_IN
		? Number(process.env.RESET_PASSWORD_EXPIRES_IN)
		: 60 * 5;

	export const EMAIL_VERIFICATION_EXPIRES_IN = process.env.EMAIL_VERIFICATION_EXPIRES_IN
		? Number(process.env.EMAIL_VERIFICATION_EXPIRES_IN)
		: 60 * 15;
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
