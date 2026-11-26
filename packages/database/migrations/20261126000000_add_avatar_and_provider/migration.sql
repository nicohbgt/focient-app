-- AlterTable
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "provider" TEXT DEFAULT 'credentials';
