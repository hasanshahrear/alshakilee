/*
  Warnings:

  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdBy` VARCHAR(191) NULL DEFAULT 'Admin',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL DEFAULT 'Admin';

-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `createdBy` VARCHAR(191) NULL DEFAULT 'Admin',
    ADD COLUMN `updatedBy` VARCHAR(191) NULL DEFAULT 'Admin';
