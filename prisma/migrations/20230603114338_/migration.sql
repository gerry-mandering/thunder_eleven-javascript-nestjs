/*
  Warnings:

  - You are about to drop the column `matchLevel` on the `matches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "matchLevel",
ADD COLUMN     "matchLevelBitMask" INTEGER NOT NULL DEFAULT 0;
