/*
  Warnings:

  - You are about to drop the column `amountFrom` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `amountTo` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `changellyOrderId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currencyFrom` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currencyTo` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amountFrom",
DROP COLUMN "amountTo",
DROP COLUMN "changellyOrderId",
DROP COLUMN "createdAt",
DROP COLUMN "currencyFrom",
DROP COLUMN "currencyTo",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bet_transaction_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "game_uuid" TEXT,
ADD COLUMN     "player_id" TEXT NOT NULL,
ADD COLUMN     "rolled_back" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "round_id" TEXT,
ADD COLUMN     "transaction_id" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transaction_id_key" ON "Transaction"("transaction_id");

-- CreateIndex
CREATE INDEX "Transaction_player_id_idx" ON "Transaction"("player_id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
