-- Add Mews sync fields to User, Guest, and Vendor tables
-- Migration: 20250108000000_add_mews_sync_fields

-- Add Mews sync fields to users table
ALTER TABLE "users" ADD COLUMN "mews_id" TEXT UNIQUE;
ALTER TABLE "users" ADD COLUMN "synced_at" TIMESTAMP(3);

-- Add Mews sync fields to guests table
ALTER TABLE "guests" ADD COLUMN "mews_id" TEXT UNIQUE;
ALTER TABLE "guests" ADD COLUMN "synced_at" TIMESTAMP(3);

-- Add Mews sync fields to vendors table
ALTER TABLE "vendors" ADD COLUMN "mews_id" TEXT UNIQUE;
ALTER TABLE "vendors" ADD COLUMN "synced_at" TIMESTAMP(3); 