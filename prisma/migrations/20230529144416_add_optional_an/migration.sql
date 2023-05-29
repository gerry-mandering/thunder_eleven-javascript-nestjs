-- AlterTable
ALTER TABLE "match results" ALTER COLUMN "homeTeamScore" DROP NOT NULL,
ALTER COLUMN "homeComment" DROP NOT NULL,
ALTER COLUMN "homemannerRate" DROP NOT NULL,
ALTER COLUMN "awayTeamScore" DROP NOT NULL,
ALTER COLUMN "awayComment" DROP NOT NULL,
ALTER COLUMN "awaymannerRate" DROP NOT NULL;
