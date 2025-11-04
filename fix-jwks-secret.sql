-- Fix Better Auth JWKS Secret Error
-- This clears the JWKS table so Better Auth can generate new keys with the current secret
-- Run this in Neon's SQL Editor

-- Delete all existing JWKS entries
DELETE FROM "jwks";

-- Verify the table is empty (optional check)
SELECT COUNT(*) FROM "jwks";

