/*
  Warnings:

  - You are about to drop the column `type` on the `Item` table. All the data in the column will be lost.
  - Added the required column `mainCategory` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "type",
ADD COLUMN     "mainCategory" TEXT NOT NULL,
ADD COLUMN     "subCategory" TEXT NOT NULL;
