/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `invoiceitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_invoiceId_fkey`;

-- AlterTable
ALTER TABLE `invoiceitem` DROP COLUMN `invoiceId`;
