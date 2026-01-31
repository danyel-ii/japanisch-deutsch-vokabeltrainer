-- CreateTable
CREATE TABLE "VocabEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceText" TEXT NOT NULL,
    "targetKana" TEXT NOT NULL,
    "targetKanji" TEXT,
    "targetRomaji" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PracticeSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direction" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "tagFilter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PracticeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sheetId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "answerKana" TEXT NOT NULL,
    "answerKanji" TEXT,
    "answerText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "PracticeItem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "PracticeSheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeItem_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VocabEntry_sourceText_targetKana_key" ON "VocabEntry"("sourceText", "targetKana");

-- CreateIndex
CREATE INDEX "PracticeItem_sheetId_order_idx" ON "PracticeItem"("sheetId", "order");
