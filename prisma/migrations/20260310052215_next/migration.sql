-- CreateEnum
CREATE TYPE "paidStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "reminders" ADD COLUMN     "status" "paidStatus" DEFAULT 'UNPAID';
