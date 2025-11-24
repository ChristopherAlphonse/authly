


export function formatLoginTime(date: Date = new Date()): string {
	const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
	const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
	const day = date.getDate();
	const year = date.getFullYear();

	// Format time in 12-hour format with AM/PM
	const hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;

	// Get timezone abbreviation
	const timeZone = new Intl.DateTimeFormat("en-US", {
		timeZoneName: "short",
	}).formatToParts(date).find((part) => part.type === "timeZoneName")?.value || "";

	return `${weekday}, ${month} ${day}, ${year} at ${hours12}:${minutes}:${seconds} ${ampm} ${timeZone}`;
}

export function getIPAddress(request: Request): string {
	const xf = request.headers.get("x-forwarded-for");
	if (xf) return xf.split(",")[0].trim();
	const xr = request.headers.get("x-real-ip");
	if (xr) return xr;
	return "unknown";
}

export function parseUserAgent(userAgent: string): string {
	return userAgent;
}

export function getDeviceInfoString(deviceInfo: string): string {
	return deviceInfo;
}

