/*
  Warnings:

  - You are about to drop the column `addtionalNote` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "addtionalNote",
ADD COLUMN     "additionalNote" TEXT;
