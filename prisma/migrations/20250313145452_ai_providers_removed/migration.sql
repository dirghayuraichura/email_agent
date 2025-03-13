/*
  Warnings:

  - The values [ANTHROPIC,CUSTOM] on the enum `AIProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AIProvider_new" AS ENUM ('OPENAI', 'LLAMAINDEX');
ALTER TABLE "AIModel" ALTER COLUMN "provider" TYPE "AIProvider_new" USING ("provider"::text::"AIProvider_new");
ALTER TYPE "AIProvider" RENAME TO "AIProvider_old";
ALTER TYPE "AIProvider_new" RENAME TO "AIProvider";
DROP TYPE "AIProvider_old";
COMMIT;
