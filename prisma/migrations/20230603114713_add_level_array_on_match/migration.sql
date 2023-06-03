/*
  Warnings:

  - You are about to drop the column `matchLevelBitMask` on the `matches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "matchLevelBitMask",
ADD COLUMN     "matchLevel" "Level"[];
