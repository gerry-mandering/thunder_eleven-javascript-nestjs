-- CreateEnum
CREATE TYPE "Evaluation" AS ENUM ('BAD', 'GOOD');

-- CreateTable
CREATE TABLE "match results" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stadiumName" TEXT NOT NULL,
    "matchLevel" "Level" NOT NULL,
    "headCountPerTeam" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "homeTeamScore" INTEGER NOT NULL,
    "homeComment" TEXT NOT NULL,
    "homemannerRate" "Evaluation" NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "awayTeamScore" INTEGER NOT NULL,
    "awayComment" TEXT NOT NULL,
    "awaymannerRate" "Evaluation" NOT NULL,

    CONSTRAINT "match results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
