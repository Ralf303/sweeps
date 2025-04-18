/*
  Warnings:

  - You are about to drop the column `referalDalyLose` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "referalDalyLose",
ADD COLUMN     "dailyLose" INTEGER NOT NULL DEFAULT 0;
