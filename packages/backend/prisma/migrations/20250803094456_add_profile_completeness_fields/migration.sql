-- Migration: Add profile completeness fields
-- Add profile_completeness and related fields to users and guests tables

-- Add profile completeness fields to users table
ALTER TABLE "users" 
ADD COLUMN "profile_completeness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_completeness_check" TIMESTAMP(3);

-- Add profile completeness fields to guests table  
ALTER TABLE "guests"
ADD COLUMN "profile_completeness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_completeness_check" TIMESTAMP(3),
ADD COLUMN "data_gaps" JSONB; 