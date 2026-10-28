-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('TOP_3', 'REGULAR', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'NEEDS_ADJUSTMENT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ScheduleBlockType" AS ENUM ('TASK', 'BUFFER', 'BREAK', 'FOCUS_SESSION');

-- CreateEnum
CREATE TYPE "CapacityStatus" AS ENUM ('LIGHT', 'OPTIMAL', 'NEAR_CAPACITY', 'OVERLOAD');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FOCUS_REMINDER', 'CAPACITY_WARNING', 'RIPPLE_SUGGESTION', 'DAILY_SUMMARY');

-- CreateEnum
CREATE TYPE "MotivationType" AS ENUM ('IDENTITY_DRIVEN', 'ACHIEVEMENT_DRIVEN', 'DISCIPLINE_DRIVEN', 'SOCIAL_DRIVEN');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "roleArchetype" TEXT DEFAULT 'Software Engineer',
    "occupancy" TEXT DEFAULT 'General',
    "workingRhythm" TEXT DEFAULT 'Early Bird',
    "schedulingStyle" TEXT DEFAULT 'Structured',
    "restTimePerTask" INTEGER NOT NULL DEFAULT 20,
    "workloadPercentage" INTEGER NOT NULL DEFAULT 60,
    "workHoursLimit" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "startWorkTime" TEXT NOT NULL DEFAULT '09:00',
    "endWorkTime" TEXT NOT NULL DEFAULT '17:00',
    "workHourStart" TEXT NOT NULL DEFAULT '09:00',
    "workHourEnd" TEXT NOT NULL DEFAULT '17:00',
    "dailyCapacityMinutes" INTEGER NOT NULL DEFAULT 480,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "visualGoals" TEXT,
    "motivationType" "MotivationType" DEFAULT 'ACHIEVEMENT_DRIVEN',
    "workStyle" TEXT DEFAULT 'Hybrid System: Structure + Flexibility',
    "timeToFirstPlanSeconds" INTEGER,
    "consistentPlanDays" INTEGER NOT NULL DEFAULT 0,
    "rescheduleTimeSavedMinutes" INTEGER NOT NULL DEFAULT 0,
    "manualAdjustmentsReducedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorToken" TEXT NOT NULL DEFAULT 'blue',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'REGULAR',
    "energyLevel" "EnergyLevel" DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "deadline" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "focusType" TEXT DEFAULT 'Deep Focus',
    "restMinutes" INTEGER NOT NULL DEFAULT 10,
    "needRestAfter" BOOLEAN NOT NULL DEFAULT true,
    "isBacklog" BOOLEAN NOT NULL DEFAULT false,
    "categoryName" TEXT,
    "categoryColor" TEXT,
    "dateDisplay" TEXT,
    "startHourDisplay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "type" "ScheduleBlockType" NOT NULL DEFAULT 'TASK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_capacities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "maxDailyMinutes" INTEGER NOT NULL DEFAULT 480,
    "allocatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "capacityMinutes" INTEGER NOT NULL DEFAULT 480,
    "capacityPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "CapacityStatus" NOT NULL DEFAULT 'LIGHT',
    "isOverloaded" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actualDurationMinutes" INTEGER NOT NULL,
    "energyLevel" "EnergyLevel",
    "moodRating" INTEGER,
    "reflectionNotes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_audit_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousStartTime" TIMESTAMP(3),
    "newStartTime" TIMESTAMP(3),
    "reasonMessage" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delayedTaskId" TEXT NOT NULL,
    "delayMinutes" INTEGER NOT NULL,
    "tasksShifted" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_scheduledStart_idx" ON "tasks"("userId", "scheduledStart");

-- CreateIndex
CREATE INDEX "tasks_userId_targetDate_idx" ON "tasks"("userId", "targetDate");

-- CreateIndex
CREATE INDEX "schedule_blocks_userId_startTime_endTime_idx" ON "schedule_blocks"("userId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "user_capacities_userId_date_key" ON "user_capacities"("userId", "date");

-- CreateIndex
CREATE INDEX "activity_logs_userId_completedAt_idx" ON "activity_logs"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "reschedule_audit_logs_userId_appliedAt_idx" ON "reschedule_audit_logs"("userId", "appliedAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_capacities" ADD CONSTRAINT "user_capacities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_audit_logs" ADD CONSTRAINT "reschedule_audit_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_audit_logs" ADD CONSTRAINT "reschedule_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_logs" ADD CONSTRAINT "reschedule_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
