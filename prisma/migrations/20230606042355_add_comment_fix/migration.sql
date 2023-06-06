/*
  Warnings:

  - You are about to drop the column `comment` on the `match results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match results" DROP COLUMN "comment";

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchResultId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_matchResultId_fkey" FOREIGN KEY ("matchResultId") REFERENCES "match results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
