-- Migration: Extend User profile fields (Step 8)
-- Add contact information, address, preferences, notes, and theme columns

ALTER TABLE "users"
ADD COLUMN "phone" VARCHAR,
ADD COLUMN "address_line1" VARCHAR,
ADD COLUMN "address_line2" VARCHAR,
ADD COLUMN "city" VARCHAR,
ADD COLUMN "state_or_province" VARCHAR,
ADD COLUMN "postal_code" VARCHAR,
ADD COLUMN "country" VARCHAR,
ADD COLUMN "preferences" JSONB,
ADD COLUMN "notes" TEXT,
ADD COLUMN "theme" VARCHAR; 