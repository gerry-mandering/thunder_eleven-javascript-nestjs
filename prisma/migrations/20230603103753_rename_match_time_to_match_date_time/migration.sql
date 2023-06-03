/*
  Warnings:

  - You are about to drop the column `matchDate` on the `matches` table. All the data in the column will be lost.
  - Added the required column `matchDateTime` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "matchDate",
ADD COLUMN     "matchDateTime" TIMESTAMP(3) NOT NULL;
