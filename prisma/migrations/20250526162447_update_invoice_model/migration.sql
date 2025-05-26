-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobile` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Customer_mobile_key`(`mobile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL,
    `totalQuantity` INTEGER NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NULL DEFAULT 0,
    `advanceAmount` DOUBLE NULL DEFAULT 0,
    `balanceAmount` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `Invoice_customerId_invoiceDate_deliveryDate_invoiceNumber_idx`(`customerId`, `invoiceDate`, `deliveryDate`, `invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `length` DOUBLE NOT NULL,
    `shoulder` DOUBLE NOT NULL,
    `hand` DOUBLE NOT NULL,
    `handLoose` VARCHAR(191) NOT NULL,
    `neck` DOUBLE NOT NULL,
    `chestLoose` DOUBLE NOT NULL,
    `centreLoose` VARCHAR(191) NOT NULL,
    `downLoose` DOUBLE NOT NULL,
    `open` DOUBLE NOT NULL,
    `button` VARCHAR(191) NOT NULL,
    `design` VARCHAR(191) NOT NULL,
    `pocket` ENUM('P2_ADI', 'P2_BAG') NOT NULL,
    `sewing` ENUM('CHAP', 'LOCK') NOT NULL,
    `sd` ENUM('SD', 'NO_SD', 'KT') NOT NULL,
    `pan` ENUM('PAN', 'NO_PAN') NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `fabric` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `invoiceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InvoiceItem_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
