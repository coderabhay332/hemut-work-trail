-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('PICKUP', 'DELIVERY');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryContact" JSONB;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "commodity" TEXT,
ADD COLUMN     "equipmentType" TEXT,
ADD COLUMN     "flags" JSONB,
ADD COLUMN     "miles" DOUBLE PRECISION,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "weightLbs" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "stops" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stopType" "StopType" NOT NULL DEFAULT 'PICKUP';
