-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "regionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
