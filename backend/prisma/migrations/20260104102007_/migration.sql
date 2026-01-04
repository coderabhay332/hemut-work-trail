/*
  Warnings:

  - Made the column `orderId` on table `stops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "rate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "stops" ALTER COLUMN "orderId" SET NOT NULL;
