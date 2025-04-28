/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refunded_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
