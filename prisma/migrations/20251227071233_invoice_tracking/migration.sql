-- CreateTable
CREATE TABLE `InvoiceTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `employeeTypeId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changedBy` VARCHAR(191) NULL,

    INDEX `InvoiceTracking_invoiceId_changedAt_idx`(`invoiceId`, `changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceTracking` ADD CONSTRAINT `InvoiceTracking_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceTracking` ADD CONSTRAINT `InvoiceTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceTracking` ADD CONSTRAINT `InvoiceTracking_employeeTypeId_fkey` FOREIGN KEY (`employeeTypeId`) REFERENCES `EmployeeType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
