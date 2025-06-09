-- CreateTable
CREATE TABLE "sellable_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "desiredProfitMargin" REAL NOT NULL,
    "totalComponentCost" REAL NOT NULL,
    "netSalePriceWithoutIVA" REAL NOT NULL,
    "ivaAmountOnSale" REAL NOT NULL,
    "finalSalePriceWithIVA" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePriceAtTimeOfAssembly" REAL NOT NULL,
    "sellableProductId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    CONSTRAINT "product_components_sellableProductId_fkey" FOREIGN KEY ("sellableProductId") REFERENCES "sellable_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_components_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
