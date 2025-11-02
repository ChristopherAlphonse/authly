import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://authly:authly_dev_password@localhost:5433/authly",
	ssl:
		process.env.DATABASE_URL?.includes("neon.tech") ||
		process.env.DATABASE_URL?.includes("sslmode=require")
			? { rejectUnauthorized: false }
			: false,
});

export const db = drizzle(pool, { schema });
