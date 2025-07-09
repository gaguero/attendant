-- CreateEnum
CREATE TYPE "vendor_category" AS ENUM ('FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'MAINTENANCE', 'OTHER');

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "vendor_category" NOT NULL DEFAULT 'OTHER',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
