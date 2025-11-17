-- Alter user_id column from uuid to text to support Clerk user IDs
ALTER TABLE "games" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;

