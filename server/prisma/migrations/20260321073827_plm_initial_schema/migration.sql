-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MakeOrBuy" AS ENUM ('MAKE', 'BUY');

-- CreateEnum
CREATE TYPE "ECOType" AS ENUM ('PRODUCT', 'BOM');

-- CreateEnum
CREATE TYPE "ChangeReason" AS ENUM ('COST_REDUCTION', 'QUALITY_ISSUE', 'CUSTOMER_DEMAND', 'REGULATORY', 'DESIGN_UPDATE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ECOStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'APPLIED');

-- CreateEnum
CREATE TYPE "ApprovalCategory" AS ENUM ('REQUIRED', 'OPTIONAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ENGINEERING_USER';
ALTER TYPE "Role" ADD VALUE 'APPROVER';
ALTER TYPE "Role" ADD VALUE 'OPERATIONS_USER';

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "salePrice" DECIMAL(15,2) NOT NULL,
    "costPrice" DECIMAL(15,2) NOT NULL,
    "attachments" TEXT[],
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_versions" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "salePrice" DECIMAL(15,2) NOT NULL,
    "costPrice" DECIMAL(15,2) NOT NULL,
    "attachments" TEXT[],
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boms" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(8) NOT NULL,
    "productId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_components" (
    "id" UUID NOT NULL,
    "bomId" UUID NOT NULL,
    "componentName" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "makeOrBuy" "MakeOrBuy" NOT NULL DEFAULT 'BUY',
    "supplier" VARCHAR(255),
    "unitCost" DECIMAL(15,2),

    CONSTRAINT "bom_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_operations" (
    "id" UUID NOT NULL,
    "bomId" UUID NOT NULL,
    "operationName" VARCHAR(255) NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "workCenter" VARCHAR(255) NOT NULL,

    CONSTRAINT "bom_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eco_stages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eco_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eco_approval_rules" (
    "id" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "approvalCategory" "ApprovalCategory" NOT NULL DEFAULT 'REQUIRED',

    CONSTRAINT "eco_approval_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecos" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "ecoType" "ECOType" NOT NULL,
    "productId" UUID NOT NULL,
    "bomId" UUID,
    "userId" UUID NOT NULL,
    "effectiveDate" TIMESTAMPTZ,
    "versionUpdate" BOOLEAN NOT NULL DEFAULT true,
    "stageId" UUID NOT NULL,
    "changeReason" "ChangeReason" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "status" "ECOStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eco_draft_changes" (
    "id" UUID NOT NULL,
    "ecoId" UUID NOT NULL,
    "fieldName" VARCHAR(100) NOT NULL,
    "recordType" VARCHAR(50) NOT NULL,
    "recordId" VARCHAR(255) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eco_draft_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "recordType" VARCHAR(100) NOT NULL,
    "recordId" VARCHAR(255) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "userId" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- AddForeignKey
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eco_approval_rules" ADD CONSTRAINT "eco_approval_rules_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "eco_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eco_approval_rules" ADD CONSTRAINT "eco_approval_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecos" ADD CONSTRAINT "ecos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecos" ADD CONSTRAINT "ecos_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecos" ADD CONSTRAINT "ecos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecos" ADD CONSTRAINT "ecos_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "eco_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eco_draft_changes" ADD CONSTRAINT "eco_draft_changes_ecoId_fkey" FOREIGN KEY ("ecoId") REFERENCES "ecos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
