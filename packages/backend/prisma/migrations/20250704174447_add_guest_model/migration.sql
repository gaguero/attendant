-- CreateEnum
CREATE TYPE "guest_status" AS ENUM ('ACTIVE', 'INACTIVE', 'VIP', 'BLACKLISTED');

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "stateOrProvince" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "preferences" TEXT,
    "notes" TEXT,
    "status" "guest_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guests_email_key" ON "guests"("email");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
