-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "contactName" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "website" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_supplier_links" (
    "id" UUID NOT NULL,
    "componentName" VARCHAR(255) NOT NULL,
    "supplierId" UUID NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 30,
    "unitCost" DECIMAL(15,2) NOT NULL,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_supplier_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- AddForeignKey
ALTER TABLE "part_supplier_links" ADD CONSTRAINT "part_supplier_links_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
