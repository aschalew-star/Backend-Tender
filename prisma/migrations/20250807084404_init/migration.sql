/*
  Warnings:

  - You are about to drop the column `notificationPreference` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPreference` on the `SystemUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "notificationPreference";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "tenderId" INTEGER;

-- AlterTable
ALTER TABLE "Reminder" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "SystemUser" DROP COLUMN "notificationPreference";

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_userId_key" ON "Reminder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_customerId_key" ON "Reminder"("customerId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
