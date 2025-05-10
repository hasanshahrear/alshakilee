/*
  Warnings:

  - The values [P2_Bag] on the enum `InvoiceItem_pocket` will be removed. If these variants are still used in the database, this will fail.
  - The values [Chap,Lock] on the enum `InvoiceItem_sewing` will be removed. If these variants are still used in the database, this will fail.
  - The values [No_SD] on the enum `InvoiceItem_sd` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pan] on the enum `InvoiceItem_pan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `invoiceitem` MODIFY `pocket` ENUM('P2', 'P2_BAG') NOT NULL,
    MODIFY `sewing` ENUM('CHAP', 'LOCK') NOT NULL,
    MODIFY `sd` ENUM('SD', 'NO_SD') NOT NULL,
    MODIFY `pan` ENUM('PAN', 'NO_PAN') NOT NULL;
