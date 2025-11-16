/**
 * Security utilities for preventing prototype pollution attacks
 * Based on OWASP Prototype Pollution Prevention Cheat Sheet
 * https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
 */

/**
 * List of dangerous keys that should never be set on objects
 * These keys can pollute the Object prototype chain
 */
const DANGEROUS_KEYS = ["__proto__", "constructor", "prototype"] as const;

/**
 * Sanitizes an object by removing dangerous keys that could lead to prototype pollution
 * Creates a new object with no prototype chain using Object.create(null)
 * 
 * @param obj - The object to sanitize (typically from untrusted JSON)
 * @returns A sanitized object with no prototype, or null if input is invalid
 * 
 * @example
 * ```typescript
 * const untrusted = JSON.parse('{"__proto__": {"isAdmin": true}}');
 * const safe = sanitizeObject(untrusted); // { } - __proto__ removed
 * ```
 */
export function sanitizeObject<T = unknown>(obj: unknown): T | null {
	if (!obj || typeof obj !== "object") {
		return null;
	}

	// Handle arrays separately
	if (Array.isArray(obj)) {
		return obj.map((item) => {
			if (item && typeof item === "object") {
				return sanitizeObject(item);
			}
			return item;
		}) as T;
	}

	// Create a new object with no prototype to prevent prototype pollution
	const safe = Object.create(null);

	for (const [key, value] of Object.entries(obj)) {
		// Skip dangerous keys that could pollute the prototype chain
		if (DANGEROUS_KEYS.includes(key as (typeof DANGEROUS_KEYS)[number])) {
			console.warn(
				`[Security] Blocked prototype pollution attempt via key: ${key}`,
			);
			continue;
		}

		// Recursively sanitize nested objects
		if (value && typeof value === "object" && !Array.isArray(value)) {
			safe[key] = sanitizeObject(value);
		} else if (Array.isArray(value)) {
			safe[key] = sanitizeObject(value);
		} else {
			safe[key] = value;
		}
	}

	return safe as T;
}

/**
 * Safely parses JSON string and sanitizes the result to prevent prototype pollution
 * Combines JSON.parse with sanitizeObject for secure JSON handling
 * 
 * @param jsonString - The JSON string to parse (from untrusted source)
 * @returns Sanitized parsed object or null if parsing fails
 * 
 * @example
 * ```typescript
 * const body = await request.text();
 * const data = safeJsonParse<{ email: string }>(body);
 * if (data) {
 *   // Safe to use data.email
 * }
 * ```
 */
export function safeJsonParse<T = unknown>(jsonString: string): T | null {
	try {
		const parsed = JSON.parse(jsonString);
		return sanitizeObject<T>(parsed);
	} catch (error) {
		console.error("[Security] JSON parse error:", error);
		return null;
	}
}

/**
 * Checks if an object has a property without using potentially polluted prototype methods
 * Uses Object.hasOwn (ES2022) for safe property checking
 * 
 * @param obj - The object to check
 * @param key - The property key to look for
 * @returns true if the object has its own property (not inherited)
 * 
 * @example
 * ```typescript
 * const data = safeJsonParse('{"name": "John"}');
 * if (hasSafeProperty(data, 'name')) {
 *   // Safe to access data.name
 * }
 * ```
 */
export function hasSafeProperty<T extends object>(
	obj: T,
	key: PropertyKey,
): boolean {
	return Object.hasOwn(obj, key);
}

/**
 * Creates a safe object with no prototype
 * Alias for Object.create(null) with better TypeScript support
 * 
 * @returns A new object with no prototype chain
 * 
 * @example
 * ```typescript
 * const safeMap = createSafeObject<Record<string, string>>();
 * safeMap['key'] = 'value'; // No prototype pollution risk
 * ```
 */
export function createSafeObject<T extends object = Record<string, unknown>>(): T {
	return Object.create(null) as T;
}

/**
 * Validates that an object doesn't contain dangerous keys
 * Useful for pre-validation before processing
 * 
 * @param obj - Object to validate
 * @returns true if object is safe, false if it contains dangerous keys
 * 
 * @example
 * ```typescript
 * if (!isObjectSafe(userInput)) {
 *   throw new Error('Invalid input detected');
 * }
 * ```
 */
export function isObjectSafe(obj: unknown): boolean {
	if (!obj || typeof obj !== "object") {
		return true;
	}

	if (Array.isArray(obj)) {
		return obj.every((item) => isObjectSafe(item));
	}

	for (const key of Object.keys(obj)) {
		if (DANGEROUS_KEYS.includes(key as (typeof DANGEROUS_KEYS)[number])) {
			return false;
		}

		const value = (obj as Record<string, unknown>)[key];
		if (value && typeof value === "object") {
			if (!isObjectSafe(value)) {
				return false;
			}
		}
	}

	return true;
}
