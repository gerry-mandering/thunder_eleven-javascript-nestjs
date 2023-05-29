/*
  Warnings:

  - Added the required column `awayTeamLeaderId` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamLeaderId` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "awayTeamLeaderId" INTEGER NOT NULL,
ADD COLUMN     "homeTeamLeaderId" INTEGER NOT NULL;
