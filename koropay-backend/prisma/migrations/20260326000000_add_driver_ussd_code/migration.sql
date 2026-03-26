-- Add ussdCode column with a temporary default
ALTER TABLE "Driver" ADD COLUMN "ussdCode" TEXT NOT NULL DEFAULT '0000';

-- Backfill existing drivers with sequential codes
DO $$
DECLARE
  r RECORD;
  counter INT := 1;
BEGIN
  FOR r IN SELECT id FROM "Driver" ORDER BY "createdAt" ASC LOOP
    UPDATE "Driver" SET "ussdCode" = LPAD(counter::TEXT, 4, '0') WHERE id = r.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Remove the default and add unique constraint
ALTER TABLE "Driver" ALTER COLUMN "ussdCode" DROP DEFAULT;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_ussdCode_key" UNIQUE ("ussdCode");
