-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_VocabEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'German',
    "sourceText" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL DEFAULT 'Japanese',
    "targetKana" TEXT NOT NULL,
    "targetKanji" TEXT,
    "targetRomaji" TEXT,
    "lessonOrDomain" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_VocabEntry" ("id", "sourceLanguage", "sourceText", "targetLanguage", "targetKana", "targetKanji", "targetRomaji", "lessonOrDomain", "orderIndex", "createdAt", "updatedAt")
SELECT
    "id",
    'German',
    "sourceText",
    'Japanese',
    "targetKana",
    "targetKanji",
    "targetRomaji",
    "tags",
    CASE WHEN "rowid" IS NULL THEN 0 ELSE "rowid" END,
    "createdAt",
    "updatedAt"
FROM "VocabEntry";

DROP TABLE "VocabEntry";
ALTER TABLE "new_VocabEntry" RENAME TO "VocabEntry";

CREATE TABLE "new_PracticeSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lessonFilter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_PracticeSheet" ("id", "direction", "count", "lessonFilter", "createdAt")
SELECT
    "id",
    "direction",
    "count",
    "tagFilter",
    "createdAt"
FROM "PracticeSheet";

DROP TABLE "PracticeSheet";
ALTER TABLE "new_PracticeSheet" RENAME TO "PracticeSheet";

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS "VocabEntry_sourceText_targetKana_key" ON "VocabEntry"("sourceText", "targetKana");
CREATE INDEX IF NOT EXISTS "PracticeItem_sheetId_order_idx" ON "PracticeItem"("sheetId", "order");

PRAGMA foreign_keys=ON;
