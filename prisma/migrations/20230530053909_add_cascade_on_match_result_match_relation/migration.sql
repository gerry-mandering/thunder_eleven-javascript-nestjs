-- DropForeignKey
ALTER TABLE "match results" DROP CONSTRAINT "match results_matchId_fkey";

-- AddForeignKey
ALTER TABLE "match results" ADD CONSTRAINT "match results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
