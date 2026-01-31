-- CreateTable
CREATE TABLE "VocabEntry" (
    "id" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'German',
    "sourceText" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL DEFAULT 'Japanese',
    "targetKana" TEXT NOT NULL,
    "targetKanji" TEXT NOT NULL,
    "targetRomaji" TEXT NOT NULL,
    "lessonOrDomain" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSheet" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lessonFilter" TEXT,
    "japaneseDisplay" TEXT NOT NULL DEFAULT 'kana',
    "showRomaji" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeItem" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "promptLanguage" TEXT NOT NULL,
    "answerKana" TEXT NOT NULL,
    "answerKanji" TEXT NOT NULL,
    "answerRomaji" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PracticeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VocabEntry_sourceText_targetKana_key" ON "VocabEntry"("sourceText", "targetKana");

-- CreateIndex
CREATE INDEX "PracticeItem_sheetId_order_idx" ON "PracticeItem"("sheetId", "order");

-- AddForeignKey
ALTER TABLE "PracticeItem" ADD CONSTRAINT "PracticeItem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "PracticeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeItem" ADD CONSTRAINT "PracticeItem_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
