/*
Warnings:

- Added the required column `icon` to the `SocialLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialLink" ADD COLUMN "icon" DEFAULT "" TEXT NOT NULL;