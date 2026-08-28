-- AlterTable
ALTER TABLE "Order" ADD COLUMN "usedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "imageUrl" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "capacity" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("capacity", "createdAt", "currency", "description", "endsAt", "id", "imageUrl", "location", "priceCents", "published", "slug", "startsAt", "title", "updatedAt") SELECT "capacity", "createdAt", "currency", "description", "endsAt", "id", "imageUrl", "location", "priceCents", "published", "slug", "startsAt", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
