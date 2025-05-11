/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `refunded_amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "balanceAfter" DECIMAL(18,8),
ADD COLUMN     "balanceBefore" DECIMAL(18,8),
ADD COLUMN     "multiplier" DOUBLE PRECISION,
ADD COLUMN     "profit" DECIMAL(18,8),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "refunded_amount" SET DATA TYPE DECIMAL(18,8);
