/*
  Warnings:

  - Added the required column `homeTeamParticipatingHeadCount` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchDate` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stadiumAddress` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "awayTeamParticipatingHeadCount" INTEGER,
ADD COLUMN     "homeTeamParticipatingHeadCount" INTEGER NOT NULL,
ADD COLUMN     "matchDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stadiumAddress" TEXT NOT NULL;
