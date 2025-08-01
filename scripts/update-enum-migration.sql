-- Drop the old enum and create a new one with lowercase values
BEGIN;

-- Step 1: Rename the old enum to avoid conflicts
ALTER TYPE "user_role" RENAME TO "user_role_old";

-- Step 2: Create the new enum with lowercase values
CREATE TYPE "user_role" AS ENUM ('admin', 'staff', 'concierge', 'viewer');

-- Step 3: Update the "users" table to use the new enum
-- This includes casting the old values to text and then to the new enum type
-- It also sets the new default value
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'staff';
ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role" USING "role"::text::"user_role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'staff';

-- Step 4: Drop the old, now unused, enum
DROP TYPE "user_role_old";

COMMIT;
