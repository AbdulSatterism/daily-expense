-- CreateEnum
CREATE TYPE "ReminderCategory" AS ENUM ('GROCERIES', 'RENT', 'TRANSPORT', 'UTILITIES', 'SHOPPING', 'HEALTH', 'FOOD', 'GAS', 'SALARY', 'BUSINESS', 'INVESTMENT', 'OTHER', 'ZAKAT', 'TAX');

-- CreateEnum
CREATE TYPE "ReminderRepeat" AS ENUM ('NONE', 'MONTHLY');

-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'TAX';

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReminderCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "repeat" "ReminderRepeat" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reminders_user_id_idx" ON "reminders"("user_id");

-- CreateIndex
CREATE INDEX "reminders_due_date_idx" ON "reminders"("due_date");

-- CreateIndex
CREATE INDEX "reminders_repeat_idx" ON "reminders"("repeat");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
