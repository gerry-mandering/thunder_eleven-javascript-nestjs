/*
  Warnings:

  - You are about to drop the column `mannerCount` on the `match results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match results" DROP COLUMN "mannerCount";

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "mannerCount" INTEGER NOT NULL DEFAULT 0;
