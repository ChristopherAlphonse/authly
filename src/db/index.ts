import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Use production database in production, local database in development
const isProduction = process.env.NODE_ENV === "production";
const connectionString = isProduction
	? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
	: process.env.DATABASE_URL ||
		"postgresql://authly:authly_dev_password@localhost:5433/authly";

// Enable SSL for Neon or any connection with sslmode=require
const requiresSSL =
	connectionString?.includes("neon.tech") ||
	connectionString?.includes("sslmode=require");

const pool = new Pool({
	connectionString,
	ssl: requiresSSL ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
