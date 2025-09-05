-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "SystemUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
