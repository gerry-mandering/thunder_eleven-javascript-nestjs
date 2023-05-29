/*
  Warnings:

  - You are about to drop the column `awayTeamHeadCount` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `awayTeamLeaderId` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `awayTeamMember` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamHeadCount` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamLeaderId` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamMember` on the `matches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_awayTeamLeaderId_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_homeTeamLeaderId_fkey";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "awayTeamHeadCount",
DROP COLUMN "awayTeamLeaderId",
DROP COLUMN "awayTeamMember",
DROP COLUMN "homeTeamHeadCount",
DROP COLUMN "homeTeamLeaderId",
DROP COLUMN "homeTeamMember",
ADD COLUMN     "awayTeamParticipatingMember" TEXT[],
ADD COLUMN     "homeTeamParticipatingMember" TEXT[];
