-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "delFlag" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "delFlag" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "delFlag" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "delFlag" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "delFlag" BOOLEAN NOT NULL DEFAULT false;
