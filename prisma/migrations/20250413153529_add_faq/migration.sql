/*
  Warnings:

  - You are about to drop the column `buttonLink` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "buttonLink",
DROP COLUMN "buttonText";

-- CreateTable
CREATE TABLE "faq" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);
