-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_VocabEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'German',
    "sourceText" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL DEFAULT 'Japanese',
    "targetKana" TEXT NOT NULL,
    "targetKanji" TEXT NOT NULL,
    "targetRomaji" TEXT NOT NULL,
    "lessonOrDomain" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_VocabEntry" ("id", "sourceLanguage", "sourceText", "targetLanguage", "targetKana", "targetKanji", "targetRomaji", "lessonOrDomain", "orderIndex", "createdAt", "updatedAt")
SELECT
    "id",
    "sourceLanguage",
    "sourceText",
    "targetLanguage",
    "targetKana",
    COALESCE("targetKanji", ''),
    COALESCE("targetRomaji", ''),
    COALESCE("lessonOrDomain", ''),
    "orderIndex",
    "createdAt",
    "updatedAt"
FROM "VocabEntry";

DROP TABLE "VocabEntry";
ALTER TABLE "new_VocabEntry" RENAME TO "VocabEntry";

CREATE TABLE "new_PracticeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sheetId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "answerKana" TEXT NOT NULL,
    "answerKanji" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "PracticeItem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "PracticeSheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeItem_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_PracticeItem" ("id", "sheetId", "vocabId", "promptText", "answerKana", "answerKanji", "answerText", "order")
SELECT
    "id",
    "sheetId",
    "vocabId",
    "promptText",
    "answerKana",
    COALESCE("answerKanji", ''),
    "answerText",
    "order"
FROM "PracticeItem";

DROP TABLE "PracticeItem";
ALTER TABLE "new_PracticeItem" RENAME TO "PracticeItem";

CREATE UNIQUE INDEX IF NOT EXISTS "VocabEntry_sourceText_targetKana_key" ON "VocabEntry"("sourceText", "targetKana");
CREATE INDEX IF NOT EXISTS "PracticeItem_sheetId_order_idx" ON "PracticeItem"("sheetId", "order");

PRAGMA foreign_keys=ON;
