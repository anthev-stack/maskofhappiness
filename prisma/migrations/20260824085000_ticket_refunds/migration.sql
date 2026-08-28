-- DropIndex
DROP INDEX IF EXISTS "Order_userId_eventId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "refundReason" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "refundRequestedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "refundReviewedAt" DATETIME;
