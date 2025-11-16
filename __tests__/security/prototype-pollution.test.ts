/**
 * Security tests for prototype pollution prevention
 * Tests the sanitization utilities in src/lib/security.ts
 */

import {
	createSafeObject,
	hasSafeProperty,
	isObjectSafe,
	safeJsonParse,
	sanitizeObject,
} from "@/lib/security";

describe("Prototype Pollution Prevention", () => {
	describe("sanitizeObject", () => {
		it("should remove __proto__ from objects", () => {
			const malicious = {
				__proto__: { isAdmin: true },
				normalKey: "value",
			};

			const result = sanitizeObject(malicious);

			expect(result).not.toHaveProperty("__proto__");
			expect(result).toHaveProperty("normalKey");
			expect(result?.normalKey).toBe("value");
		});

		it("should remove constructor from objects", () => {
			const malicious = {
				constructor: { prototype: { isAdmin: true } },
				normalKey: "value",
			};

			const result = sanitizeObject(malicious);

			expect(result).not.toHaveProperty("constructor");
			expect(result?.normalKey).toBe("value");
		});

		it("should remove prototype from objects", () => {
			const malicious = {
				prototype: { isAdmin: true },
				normalKey: "value",
			};

			const result = sanitizeObject(malicious);

			expect(result).not.toHaveProperty("prototype");
			expect(result?.normalKey).toBe("value");
		});

		it("should handle nested dangerous keys", () => {
			const malicious = {
				user: {
					name: "John",
					__proto__: { isAdmin: true },
				},
			};

			const result = sanitizeObject(malicious);

			expect(result?.user).toBeDefined();
			expect(result?.user).not.toHaveProperty("__proto__");
			expect(result?.user?.name).toBe("John");
		});

		it("should handle arrays correctly", () => {
			const input = [
				{ name: "item1" },
				{ name: "item2", __proto__: { evil: true } },
			];

			const result = sanitizeObject(input);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			expect(result?.[0]?.name).toBe("item1");
			expect(result?.[1]?.name).toBe("item2");
			expect(result?.[1]).not.toHaveProperty("__proto__");
		});

		it("should return null for non-object inputs", () => {
			expect(sanitizeObject(null)).toBeNull();
			expect(sanitizeObject(undefined)).toBeNull();
			expect(sanitizeObject("string")).toBeNull();
			expect(sanitizeObject(123)).toBeNull();
		});
	});

	describe("safeJsonParse", () => {
		it("should safely parse JSON and remove __proto__", () => {
			const maliciousJson = '{"__proto__": {"isAdmin": true}, "name": "John"}';

			const result = safeJsonParse(maliciousJson);

			expect(result).not.toHaveProperty("__proto__");
			expect(result?.name).toBe("John");

			// Verify global Object.prototype is not polluted
			const testObj = {};
			expect((testObj as { isAdmin?: boolean }).isAdmin).toBeUndefined();
		});

		it("should handle nested prototype pollution attempts", () => {
			const maliciousJson = JSON.stringify({
				user: {
					data: {
						__proto__: { role: "admin" },
						name: "Alice",
					},
				},
			});

			const result = safeJsonParse(maliciousJson);

			expect(result?.user?.data).not.toHaveProperty("__proto__");
			expect(result?.user?.data?.name).toBe("Alice");
		});

		it("should return null for invalid JSON", () => {
			const invalidJson = "{invalid json}";
			const result = safeJsonParse(invalidJson);

			expect(result).toBeNull();
		});

		it("should handle constructor pollution attempts", () => {
			const maliciousJson =
				'{"constructor": {"prototype": {"isAdmin": true}}}';

			const result = safeJsonParse(maliciousJson);

			expect(result).not.toHaveProperty("constructor");

			// Verify no pollution occurred
			const testObj = {};
			expect((testObj as { isAdmin?: boolean }).isAdmin).toBeUndefined();
		});
	});

	describe("isObjectSafe", () => {
		it("should return false for objects with __proto__", () => {
			const unsafe = { __proto__: { evil: true } };
			expect(isObjectSafe(unsafe)).toBe(false);
		});

		it("should return false for objects with constructor", () => {
			const unsafe = { constructor: { prototype: {} } };
			expect(isObjectSafe(unsafe)).toBe(false);
		});

		it("should return false for objects with prototype", () => {
			const unsafe = { prototype: { evil: true } };
			expect(isObjectSafe(unsafe)).toBe(false);
		});

		it("should return true for safe objects", () => {
			const safe = { name: "John", age: 30 };
			expect(isObjectSafe(safe)).toBe(true);
		});

		it("should return false for nested dangerous keys", () => {
			const unsafe = {
				user: {
					name: "John",
					data: {
						__proto__: { admin: true },
					},
				},
			};
			expect(isObjectSafe(unsafe)).toBe(false);
		});

		it("should return true for primitive values", () => {
			expect(isObjectSafe(null)).toBe(true);
			expect(isObjectSafe(undefined)).toBe(true);
			expect(isObjectSafe("string")).toBe(true);
			expect(isObjectSafe(123)).toBe(true);
		});
	});

	describe("createSafeObject", () => {
		it("should create object with no prototype", () => {
			const obj = createSafeObject();

			// Object should have no prototype
			expect(Object.getPrototypeOf(obj)).toBeNull();
		});

		it("should allow setting properties safely", () => {
			const obj = createSafeObject<Record<string, string>>();

			obj.key = "value";
			expect(obj.key).toBe("value");
		});
	});

	describe("hasSafeProperty", () => {
		it("should check own properties correctly", () => {
			const obj = { name: "John", age: 30 };

			expect(hasSafeProperty(obj, "name")).toBe(true);
			expect(hasSafeProperty(obj, "age")).toBe(true);
			expect(hasSafeProperty(obj, "toString")).toBe(false);
		});

		it("should work with safe objects", () => {
			const obj = createSafeObject<{ name: string }>();
			obj.name = "Alice";

			expect(hasSafeProperty(obj, "name")).toBe(true);
			expect(hasSafeProperty(obj, "other")).toBe(false);
		});
	});

	describe("Integration: Real-world attack scenarios", () => {
		it("should prevent privilege escalation via __proto__", () => {
			// Simulate malicious API request
			const maliciousPayload = JSON.stringify({
				email: "attacker@evil.com",
				__proto__: {
					isAdmin: true,
					role: "admin",
				},
			});

			const parsed = safeJsonParse(maliciousPayload);

			// Verify attack was blocked
			expect(parsed?.email).toBe("attacker@evil.com");
			expect(parsed).not.toHaveProperty("__proto__");

			// Verify no global pollution
			const newUser = {};
			expect((newUser as { isAdmin?: boolean }).isAdmin).toBeUndefined();
		});

		it("should prevent DoS via prototype pollution", () => {
			const maliciousPayload = JSON.stringify({
				__proto__: {
					toString: null,
					valueOf: null,
				},
			});

			const parsed = safeJsonParse(maliciousPayload);

			// Verify attack was blocked
			expect(parsed).not.toHaveProperty("__proto__");

			// Verify toString still works on new objects
			const testObj = {};
			expect(() => testObj.toString()).not.toThrow();
		});

		it("should handle complex nested attack vectors", () => {
			const maliciousPayload = JSON.stringify({
				user: {
					profile: {
						settings: {
							__proto__: {
								polluted: true,
							},
							theme: "dark",
						},
					},
				},
			});

			const parsed = safeJsonParse(maliciousPayload);

			expect(parsed?.user?.profile?.settings?.theme).toBe("dark");
			expect(parsed?.user?.profile?.settings).not.toHaveProperty("__proto__");

			// Verify no pollution
			const clean = {};
			expect((clean as { polluted?: boolean }).polluted).toBeUndefined();
		});
	});
});
