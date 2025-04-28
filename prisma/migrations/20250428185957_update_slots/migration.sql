/*
  Warnings:

  - You are about to drop the column `player_id` on the `Transaction` table. All the data in the column will be lost.
  - Made the column `userId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "Transaction_player_id_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "player_id",
ADD COLUMN     "refunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "session_id" TEXT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "action" DROP DEFAULT,
ALTER COLUMN "amount" DROP DEFAULT,
ALTER COLUMN "currency" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "current_session" TEXT,
ALTER COLUMN "referralAllLose" SET DEFAULT 0,
ALTER COLUMN "referralAllLose" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "dailyLose" SET DEFAULT 0,
ALTER COLUMN "dailyLose" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_round_id_idx" ON "Transaction"("round_id");

-- CreateIndex
CREATE INDEX "Transaction_game_uuid_idx" ON "Transaction"("game_uuid");

-- CreateIndex
CREATE INDEX "Transaction_created_at_idx" ON "Transaction"("created_at");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bet_transaction_id_fkey" FOREIGN KEY ("bet_transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE SET NULL ON UPDATE CASCADE;
