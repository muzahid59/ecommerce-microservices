/*
  Warnings:

  - You are about to drop the column `expriesAt` on the `VerificationCode` table. All the data in the column will be lost.
  - You are about to drop the column `vefifiedAt` on the `VerificationCode` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationCode" DROP COLUMN "expriesAt",
DROP COLUMN "vefifiedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
