-- AlterTable
ALTER TABLE "Setting" ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT 'maskofhappiness';
ALTER TABLE "Setting" ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT 'Community events and shared listening from maskofhappiness.';
ALTER TABLE "Setting" ADD COLUMN "seoKeywords" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Setting" ADD COLUMN "ogImageUrl" TEXT;
ALTER TABLE "Setting" ADD COLUMN "faviconUrl" TEXT;
ALTER TABLE "Setting" ADD COLUMN "appleIconUrl" TEXT;
ALTER TABLE "Setting" ADD COLUMN "themeColor" TEXT NOT NULL DEFAULT '#080808';
ALTER TABLE "Setting" ADD COLUMN "appleAppTitle" TEXT NOT NULL DEFAULT 'maskofhappiness';
