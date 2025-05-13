/*
  Warnings:

  - You are about to drop the column `vefified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "vefified",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
