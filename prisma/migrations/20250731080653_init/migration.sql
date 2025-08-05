-- DropForeignKey
ALTER TABLE "Tender" DROP CONSTRAINT "Tender_postedById_fkey";

-- AlterTable
ALTER TABLE "Tender" ALTER COLUMN "postedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
