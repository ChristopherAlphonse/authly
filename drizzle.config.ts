import { defineConfig } from "drizzle-kit";

const getDatabaseUrl = (): string => {
	if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL_PROD) {
		return process.env.DATABASE_URL_PROD;
	}
	return process.env.DATABASE_URL!;
};

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: getDatabaseUrl(),
	},
});
