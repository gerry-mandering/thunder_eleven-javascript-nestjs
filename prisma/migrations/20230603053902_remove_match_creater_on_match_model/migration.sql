/*
  Warnings:

  - You are about to drop the column `userId` on the `matches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_userId_fkey";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "userId";
