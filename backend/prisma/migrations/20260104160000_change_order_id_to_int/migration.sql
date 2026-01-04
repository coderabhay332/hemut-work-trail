-- Migration: Change Order ID from UUID to Sequential Integer
-- WARNING: This migration will reassign order IDs sequentially based on creation date
-- Existing relationships will be preserved

-- Step 1: Create temporary mapping table (drop if exists from previous failed migration)
DROP TABLE IF EXISTS order_id_mapping;
CREATE TEMP TABLE order_id_mapping AS
SELECT 
  o.id as old_id,
  row_number() OVER (ORDER BY o."createdAt", o.id) as new_id
FROM "orders" o;

-- Step 2: Add new integer ID column to orders table
ALTER TABLE "orders" ADD COLUMN "id_new" INTEGER;

-- Step 3: Populate new integer IDs in orders
UPDATE "orders" o
SET "id_new" = m.new_id
FROM order_id_mapping m
WHERE o.id = m.old_id;

-- Step 4: Add new integer orderId column to stops table
ALTER TABLE "stops" ADD COLUMN "orderId_new" INTEGER;

-- Step 5: Populate new orderId in stops using the mapping
UPDATE "stops" s
SET "orderId_new" = m.new_id
FROM order_id_mapping m
WHERE s."orderId" = m.old_id;

-- Step 6: Drop foreign key constraint on stops
ALTER TABLE "stops" DROP CONSTRAINT IF EXISTS "stops_orderId_fkey";

-- Step 7: Drop unique constraint and index
DROP INDEX IF EXISTS "stops_orderId_sequence_key";
DROP INDEX IF EXISTS "stops_orderId_idx";

-- Step 8: Drop old columns
ALTER TABLE "stops" DROP COLUMN "orderId";
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey";
ALTER TABLE "orders" DROP COLUMN "id";

-- Step 9: Rename new columns
ALTER TABLE "orders" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "stops" RENAME COLUMN "orderId_new" TO "orderId";

-- Step 10: Set primary key
ALTER TABLE "orders" ADD PRIMARY KEY ("id");

-- Step 10b: Create sequence and set it to continue from max ID
CREATE SEQUENCE IF NOT EXISTS "orders_id_seq" OWNED BY "orders"."id";
SELECT setval('orders_id_seq', COALESCE((SELECT MAX("id") FROM "orders"), 1), true);
ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT nextval('orders_id_seq');

-- Step 11: Recreate foreign key constraint
ALTER TABLE "stops" ADD CONSTRAINT "stops_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 12: Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS "stops_orderId_sequence_key" ON "stops"("orderId", "sequence");
CREATE INDEX IF NOT EXISTS "stops_orderId_idx" ON "stops"("orderId");

