/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `Reminder` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationPreference" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'DAILY');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "notificationPreference" "NotificationPreference" DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "categoryId",
DROP COLUMN "regionId",
DROP COLUMN "subcategoryId",
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationPreference" NOT NULL;

-- AlterTable
ALTER TABLE "SystemUser" ADD COLUMN     "notificationPreference" "NotificationPreference" DEFAULT 'DAILY';

-- CreateTable
CREATE TABLE "ReminderCategory" (
    "reminderId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "ReminderCategory_pkey" PRIMARY KEY ("reminderId","categoryId")
);

-- CreateTable
CREATE TABLE "ReminderSubcategory" (
    "reminderId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,

    CONSTRAINT "ReminderSubcategory_pkey" PRIMARY KEY ("reminderId","subcategoryId")
);

-- CreateTable
CREATE TABLE "ReminderRegion" (
    "reminderId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "ReminderRegion_pkey" PRIMARY KEY ("reminderId","regionId")
);

-- CreateTable
CREATE TABLE "PendingNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "customerId" INTEGER,
    "tenderId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notifyAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "customerId" INTEGER,
    "pendingNotificationId" INTEGER,
    "tenderId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderCategory" ADD CONSTRAINT "ReminderCategory_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderCategory" ADD CONSTRAINT "ReminderCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderSubcategory" ADD CONSTRAINT "ReminderSubcategory_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderSubcategory" ADD CONSTRAINT "ReminderSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRegion" ADD CONSTRAINT "ReminderRegion_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRegion" ADD CONSTRAINT "ReminderRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingNotification" ADD CONSTRAINT "PendingNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingNotification" ADD CONSTRAINT "PendingNotification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingNotification" ADD CONSTRAINT "PendingNotification_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_pendingNotificationId_fkey" FOREIGN KEY ("pendingNotificationId") REFERENCES "PendingNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
