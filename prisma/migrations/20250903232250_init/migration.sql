-- CreateTable
CREATE TABLE "Advertisement" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "SystemUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
