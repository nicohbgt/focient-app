-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "focusType" SET DEFAULT 'High';
ALTER TABLE "tasks" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tasks" ADD COLUMN "recurrencePattern" TEXT;
ALTER TABLE "tasks" ADD COLUMN "recurrenceDays" TEXT;
