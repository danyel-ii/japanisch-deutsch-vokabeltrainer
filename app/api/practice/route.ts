import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const directions = new Set(["DE_JA", "JA_DE", "MIXED"]);
const japaneseDisplays = new Set(["kana", "kanji"]);

function matchesLesson(value: string | null, query: string) {
  if (!value) return false;
  return value.trim().toLowerCase() === query.trim().toLowerCase();
}

export async function GET() {
  const sheets = await prisma.practiceSheet.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ sheets });
}

export async function POST(req: Request) {
  const body = await req.json();
  const direction =
    typeof body.direction === "string"
      ? (body.direction as "DE_JA" | "JA_DE" | "MIXED")
      : null;
  const count = Math.floor(Number(body.count));
  const lessonFilter = typeof body.lessonFilter === "string" ? body.lessonFilter.trim() : "";
  const japaneseDisplay =
    typeof body.japaneseDisplay === "string" ? body.japaneseDisplay : "kana";
  const showRomaji = body.showRomaji === true;

  if (!direction || !directions.has(direction)) {
    return NextResponse.json({ error: "Richtung ist ungueltig." }, { status: 400 });
  }

  if (!japaneseDisplays.has(japaneseDisplay)) {
    return NextResponse.json({ error: "Japanisch-Anzeige ist ungueltig." }, { status: 400 });
  }

  if (!Number.isFinite(count) || count <= 0) {
    return NextResponse.json({ error: "Anzahl muss groesser als 0 sein." }, { status: 400 });
  }

  const entries = await prisma.vocabEntry.findMany({
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }]
  });

  const filtered = lessonFilter
    ? entries.filter((entry) => matchesLesson(entry.lessonOrDomain, lessonFilter))
    : entries;

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: "Keine Eintraege passen zu diesem Filter." },
      { status: 400 }
    );
  }

  const actualCount = Math.min(count, filtered.length);
  const selected = filtered.slice(0, actualCount);

  const sheet = await prisma.practiceSheet.create({
    data: {
      direction,
      count: actualCount,
      lessonFilter: lessonFilter || null,
      japaneseDisplay,
      showRomaji
    }
  });

  const formatJapanese = (entry: typeof selected[number]) => {
    if (japaneseDisplay === "kanji") {
      return entry.targetKanji || entry.targetKana;
    }
    return entry.targetKana;
  };

  const withRomaji = (value: string, romaji: string | null) => {
    if (!showRomaji || !romaji) return value;
    return `${value} (${romaji})`;
  };

  const itemsData = selected.map((entry, index) => {
    const promptLanguage =
      direction === "MIXED" ? (index % 2 === 0 ? "DE" : "JA") : direction === "DE_JA" ? "DE" : "JA";
    const promptText =
      promptLanguage === "DE"
        ? entry.sourceText
        : withRomaji(formatJapanese(entry), entry.targetRomaji);

    return {
      sheetId: sheet.id,
      vocabId: entry.id,
      promptText,
      promptLanguage,
      answerKana: entry.targetKana,
      answerKanji: entry.targetKanji,
      answerRomaji: entry.targetRomaji,
      answerText: entry.sourceText,
      order: index + 1
    };
  });

  await prisma.practiceItem.createMany({ data: itemsData });

  const sheetWithItems = await prisma.practiceSheet.findUnique({
    where: { id: sheet.id },
    include: { items: { orderBy: { order: "asc" } } }
  });

  return NextResponse.json({ sheet: sheetWithItems }, { status: 201 });
}
