/*
  Warnings:

  - Added the required column `endDate` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Advertisement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
