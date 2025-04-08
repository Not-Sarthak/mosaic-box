/*
  Warnings:

  - You are about to drop the column `content` on the `Block` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Block` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Social` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('BLOCK', 'SOCIAL');

-- CreateEnum
CREATE TYPE "SocialType" AS ENUM ('TWITTER', 'INSTAGRAM', 'GITHUB', 'LINKEDIN', 'DRIBBBLE', 'BUYMEACOFFEE');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TITLE', 'NOTE', 'MEDIA', 'MAP');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_userId_fkey";

-- DropForeignKey
ALTER TABLE "Social" DROP CONSTRAINT "Social_userId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "content",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "BlockType" NOT NULL;

-- AlterTable
ALTER TABLE "Social" DROP COLUMN "type",
ADD COLUMN     "type" "SocialType" NOT NULL;

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "order" INTEGER NOT NULL,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 1,
    "height" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "blockId" TEXT,
    "socialId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitterProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "TwitterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "GitHubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "LinkedInProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DribbbleProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "DribbbleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "InstagramProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyMeACoffeeProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "socialId" TEXT NOT NULL,

    CONSTRAINT "BuyMeACoffeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitleBlock" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "TitleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteBlock" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "NoteBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaBlock" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "MediaBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapBlock" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "MapBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_blockId_idx" ON "Item"("blockId");

-- CreateIndex
CREATE INDEX "Item_socialId_idx" ON "Item"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterProfile_socialId_key" ON "TwitterProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubProfile_socialId_key" ON "GitHubProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInProfile_socialId_key" ON "LinkedInProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "DribbbleProfile_socialId_key" ON "DribbbleProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramProfile_socialId_key" ON "InstagramProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyMeACoffeeProfile_socialId_key" ON "BuyMeACoffeeProfile"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "TitleBlock_blockId_key" ON "TitleBlock"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteBlock_blockId_key" ON "NoteBlock"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaBlock_blockId_key" ON "MediaBlock"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "MapBlock_blockId_key" ON "MapBlock"("blockId");

-- CreateIndex
CREATE INDEX "Block_userId_idx" ON "Block"("userId");

-- CreateIndex
CREATE INDEX "Social_userId_idx" ON "Social"("userId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitterProfile" ADD CONSTRAINT "TwitterProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubProfile" ADD CONSTRAINT "GitHubProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedInProfile" ADD CONSTRAINT "LinkedInProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DribbbleProfile" ADD CONSTRAINT "DribbbleProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramProfile" ADD CONSTRAINT "InstagramProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyMeACoffeeProfile" ADD CONSTRAINT "BuyMeACoffeeProfile_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitleBlock" ADD CONSTRAINT "TitleBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteBlock" ADD CONSTRAINT "NoteBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBlock" ADD CONSTRAINT "MediaBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapBlock" ADD CONSTRAINT "MapBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
