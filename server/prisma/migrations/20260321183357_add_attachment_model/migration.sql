/*
  Warnings:

  - You are about to drop the column `attachments` on the `product_versions` table. All the data in the column will be lost.
  - You are about to drop the column `attachments` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_versions" DROP COLUMN "attachments";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "attachments";

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID,
    "productVersionId" UUID,
    "ecoId" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_productVersionId_fkey" FOREIGN KEY ("productVersionId") REFERENCES "product_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_ecoId_fkey" FOREIGN KEY ("ecoId") REFERENCES "ecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
