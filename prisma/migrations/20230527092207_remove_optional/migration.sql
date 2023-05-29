/*
  Warnings:

  - Made the column `teamLevel` on table `teams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mannerRate` on table `teams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `headCount` on table `teams` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "teamLevel" SET NOT NULL,
ALTER COLUMN "mannerRate" SET NOT NULL,
ALTER COLUMN "headCount" SET NOT NULL;
