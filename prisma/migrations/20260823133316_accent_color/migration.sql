-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site',
    "homepageLogoUrl" TEXT,
    "homepageLogoSourceUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#e11d48'
);
INSERT INTO "new_Setting" ("homepageLogoSourceUrl", "homepageLogoUrl", "id") SELECT "homepageLogoSourceUrl", "homepageLogoUrl", "id" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
