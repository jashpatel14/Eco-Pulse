/*
  Warnings:

  - You are about to drop the column `notifEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `part_supplier_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_ecoId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_productId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_productVersionId_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_userId_fkey";

-- DropForeignKey
ALTER TABLE "part_supplier_links" DROP CONSTRAINT "part_supplier_links_supplierId_fkey";

-- AlterTable
ALTER TABLE "boms" ADD COLUMN     "createdById" UUID,
ADD COLUMN     "ecoId" UUID;

-- AlterTable
ALTER TABLE "product_versions" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "createdById" UUID,
ADD COLUMN     "ecoId" UUID;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "attachments" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "notifEmail";

-- DropTable
DROP TABLE "attachments";

-- DropTable
DROP TABLE "part_supplier_links";

-- DropTable
DROP TABLE "suppliers";

-- AddForeignKey
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_ecoId_fkey" FOREIGN KEY ("ecoId") REFERENCES "ecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_ecoId_fkey" FOREIGN KEY ("ecoId") REFERENCES "ecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
