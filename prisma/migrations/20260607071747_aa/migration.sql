-- CreateEnum
CREATE TYPE "CapitalApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReminderCategory" AS ENUM ('GROCERIES', 'RENT', 'TRANSPORT', 'UTILITIES', 'SHOPPING', 'HEALTH', 'FOOD', 'GAS', 'SALARY', 'BUSINESS', 'INVESTMENT', 'OTHER', 'ZAKAT', 'TAX');

-- CreateEnum
CREATE TYPE "ReminderRepeat" AS ENUM ('NONE', 'MONTHLY');

-- CreateEnum
CREATE TYPE "paidStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GROCERIES', 'RENT', 'TRANSPORT', 'UTILITIES', 'SHOPPING', 'HEALTH', 'FOOD', 'GAS', 'SALARY', 'BUSINESS', 'INVESTMENT', 'OTHER', 'ZAKAT', 'TAX');

-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ECreditScore" AS ENUM ('AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'HX', 'GX');

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "appointment_time" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "capital_range" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "has_noa" BOOLEAN NOT NULL DEFAULT false,
    "has_cbs_report" BOOLEAN NOT NULL DEFAULT false,
    "has_acra_record" BOOLEAN NOT NULL DEFAULT false,
    "has_bank_statement" BOOLEAN NOT NULL DEFAULT false,
    "capital_range" TEXT,
    "status" "CapitalApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReminderCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "repeat" "ReminderRepeat" NOT NULL DEFAULT 'NONE',
    "status" "paidStatus" DEFAULT 'UNPAID',
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_tokens" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" "Category" NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "image" TEXT DEFAULT '',
    "document" TEXT DEFAULT '',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "creditScore" "ECreditScore",
    "role" TEXT NOT NULL DEFAULT 'USER',
    "image" TEXT DEFAULT '',
    "gender" "EGender" DEFAULT 'OTHER',
    "google_id" TEXT DEFAULT '',
    "facebook_id" TEXT DEFAULT '',
    "apple_id" TEXT DEFAULT '',
    "online" BOOLEAN NOT NULL DEFAULT false,
    "document" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "auth_is_reset_password" BOOLEAN NOT NULL DEFAULT false,
    "auth_one_time_code" INTEGER,
    "auth_expire_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_loan_amount" DECIMAL(12,2) DEFAULT 0,
    "loan_tenure" INTEGER DEFAULT 0,
    "monthly_repayment_amount" DECIMAL(12,2) DEFAULT 0,
    "loan_start_date" TIMESTAMP(3),
    "monthly_due_day" INTEGER DEFAULT 0,
    "remaining_tenure" INTEGER DEFAULT 0,
    "creditScore" "ECreditScore",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capital_applications_email_key" ON "capital_applications"("email");

-- CreateIndex
CREATE INDEX "reminders_user_id_idx" ON "reminders"("user_id");

-- CreateIndex
CREATE INDEX "reminders_due_date_idx" ON "reminders"("due_date");

-- CreateIndex
CREATE INDEX "reminders_repeat_idx" ON "reminders"("repeat");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "finance_profiles_user_id_key" ON "finance_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_tokens" ADD CONSTRAINT "reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_profiles" ADD CONSTRAINT "finance_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
