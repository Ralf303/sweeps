-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "isPin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
