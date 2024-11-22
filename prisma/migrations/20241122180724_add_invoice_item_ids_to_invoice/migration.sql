/*
  Warnings:

  - Added the required column `invoiceItemsIds` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `invoiceItemsIds` JSON NOT NULL;
