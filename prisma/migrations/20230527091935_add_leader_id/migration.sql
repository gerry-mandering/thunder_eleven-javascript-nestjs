/*
  Warnings:

  - You are about to drop the column `userId` on the `teams` table. All the data in the column will be lost.
  - Added the required column `leaderId` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_userId_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "userId",
ADD COLUMN     "leaderId" INTEGER NOT NULL,
ALTER COLUMN "headCount" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
