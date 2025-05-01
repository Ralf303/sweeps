-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "refPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "regIp" TEXT;
