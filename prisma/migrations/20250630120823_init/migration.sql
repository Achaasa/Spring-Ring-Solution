-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE 'COMBINED';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "price" DOUBLE PRECISION;
