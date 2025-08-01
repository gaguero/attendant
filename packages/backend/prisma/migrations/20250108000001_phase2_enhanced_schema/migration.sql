-- CreateEnum
CREATE TYPE "sync_status" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "sync_direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "rule_type" AS ENUM ('REQUIRED', 'FORMAT', 'RANGE', 'CUSTOM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "sync_status" "sync_status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "profile_completeness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_completeness_check" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "guests" ADD COLUMN "sync_status" "sync_status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "profile_completeness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_completeness_check" TIMESTAMP(3),
ADD COLUMN "data_gaps" JSONB,
ADD COLUMN "vip_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "last_stay" TIMESTAMP(3),
ADD COLUMN "total_stays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "average_spending" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "sync_status" "sync_status" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "mews_sync_logs" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "direction" "sync_direction" NOT NULL DEFAULT 'INBOUND',
    "status" "sync_status" NOT NULL DEFAULT 'PENDING',
    "mews_event_id" TEXT,
    "mews_data" JSONB,
    "platform_data" JSONB,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" UUID,
    "guest_id" TEXT,
    "vendor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mews_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity_type" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "rule_type" "rule_type" NOT NULL,
    "rule_config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completeness_configs" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_weights" JSONB NOT NULL,
    "required_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "optional_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completeness_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_rules_name_key" ON "business_rules"("name");

-- CreateIndex
CREATE UNIQUE INDEX "completeness_configs_entity_type_key" ON "completeness_configs"("entity_type");

-- AddForeignKey
ALTER TABLE "mews_sync_logs" ADD CONSTRAINT "mews_sync_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mews_sync_logs" ADD CONSTRAINT "mews_sync_logs_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mews_sync_logs" ADD CONSTRAINT "mews_sync_logs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE; 