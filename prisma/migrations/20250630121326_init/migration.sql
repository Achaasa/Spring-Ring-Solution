/*
  Warnings:

  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "price";
