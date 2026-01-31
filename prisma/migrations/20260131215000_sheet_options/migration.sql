PRAGMA foreign_keys=OFF;

ALTER TABLE "PracticeSheet" ADD COLUMN "japaneseDisplay" TEXT NOT NULL DEFAULT 'kana';
ALTER TABLE "PracticeSheet" ADD COLUMN "showRomaji" BOOLEAN NOT NULL DEFAULT 0;

ALTER TABLE "PracticeItem" ADD COLUMN "promptLanguage" TEXT NOT NULL DEFAULT 'DE';
ALTER TABLE "PracticeItem" ADD COLUMN "answerRomaji" TEXT NOT NULL DEFAULT '';

PRAGMA foreign_keys=ON;
