/*
  Warnings:

  - You are about to drop the column `refreshtoken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshtoken";

-- CreateTable
CREATE TABLE "Refreshtoken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Refreshtoken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refreshtoken_tokenHash_key" ON "Refreshtoken"("tokenHash");

-- AddForeignKey
ALTER TABLE "Refreshtoken" ADD CONSTRAINT "Refreshtoken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
