/*
  Warnings:

  - You are about to drop the column `awayComment` on the `match results` table. All the data in the column will be lost.
  - You are about to drop the column `homeComment` on the `match results` table. All the data in the column will be lost.
  - Added the required column `userId` to the `match results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "match results" DROP CONSTRAINT "match results_matchId_fkey";

-- AlterTable
ALTER TABLE "match results" DROP COLUMN "awayComment",
DROP COLUMN "homeComment",
ADD COLUMN     "awaymannerCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "comment" TEXT[],
ADD COLUMN     "homemannerCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
