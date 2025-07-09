/*
  Warnings:

  - The `preferences` column on the `guests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "external_booking_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "preferences",
ADD COLUMN     "preferences" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "contact_person" TEXT,
ADD COLUMN     "services_offered" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
