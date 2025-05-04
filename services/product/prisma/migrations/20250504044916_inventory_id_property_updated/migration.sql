/*
  Warnings:

  - You are about to drop the column `invertoryId` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "invertoryId",
ADD COLUMN     "inventoryId" TEXT;
