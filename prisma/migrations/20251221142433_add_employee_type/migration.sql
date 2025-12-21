-- AlterTable
ALTER TABLE `User` ADD COLUMN `employeeTypeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `EmployeeType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmployeeType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeTypeId_fkey` FOREIGN KEY (`employeeTypeId`) REFERENCES `EmployeeType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
