/*
  Warnings:

  - You are about to drop the column `awayTeamId` on the `match results` table. All the data in the column will be lost.
  - You are about to drop the column `headCountPerTeam` on the `match results` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamId` on the `match results` table. All the data in the column will be lost.
  - You are about to drop the column `matchLevel` on the `match results` table. All the data in the column will be lost.
  - You are about to drop the column `stadiumName` on the `match results` table. All the data in the column will be lost.
  - Added the required column `matchId` to the `match results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "match results" DROP CONSTRAINT "match results_awayTeamId_fkey";

-- DropForeignKey
ALTER TABLE "match results" DROP CONSTRAINT "match results_homeTeamId_fkey";

-- AlterTable
ALTER TABLE "match results" DROP COLUMN "awayTeamId",
DROP COLUMN "headCountPerTeam",
DROP COLUMN "homeTeamId",
DROP COLUMN "matchLevel",
DROP COLUMN "stadiumName",
ADD COLUMN     "matchId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
