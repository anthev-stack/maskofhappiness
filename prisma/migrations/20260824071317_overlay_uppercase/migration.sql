-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site',
    "homepageLogoUrl" TEXT,
    "homepageLogoSourceUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#e11d48',
    "listenTitle" TEXT NOT NULL DEFAULT 'Listen with us',
    "listenBlurb" TEXT NOT NULL DEFAULT 'The brand is built around sharing and listening. These are the playlists we are on right now.',
    "logoOverlay" TEXT NOT NULL DEFAULT '',
    "logoOverlayUppercase" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Setting" ("accentColor", "homepageLogoSourceUrl", "homepageLogoUrl", "id", "listenBlurb", "listenTitle", "logoOverlay") SELECT "accentColor", "homepageLogoSourceUrl", "homepageLogoUrl", "id", "listenBlurb", "listenTitle", "logoOverlay" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
