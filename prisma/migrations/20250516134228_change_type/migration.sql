/*
  Warnings:

  - Changed the type of `symbol` on the `CryptoCurrency` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CryptoCurrency" DROP COLUMN "symbol",
ADD COLUMN     "symbol" INTEGER NOT NULL;
