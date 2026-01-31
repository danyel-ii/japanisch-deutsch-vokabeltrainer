import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

type HeaderMap = {
  headerRow: number;
  deutsch: number;
  japanisch: number;
  kanji: number;
  romaji: number;
  lesson: number;
};

function normalizeHeader(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function findHeader(rows: unknown[][]): HeaderMap | null {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i].map(normalizeHeader);
    const deutsch = row.indexOf("deutsch");
    const japanisch = row.indexOf("japanisch");

    if (deutsch !== -1 && japanisch !== -1) {
      const kanji = row.indexOf("kanji");
      const romaji = row.indexOf("romaji/lautschrift");
      const romajiFallback = row.indexOf("romaji");
      const lesson =
        row.indexOf("lektion") !== -1
          ? row.indexOf("lektion")
          : row.indexOf("lesson") !== -1
          ? row.indexOf("lesson")
          : row.indexOf("domain") !== -1
          ? row.indexOf("domain")
          : row.indexOf("thema") !== -1
          ? row.indexOf("thema")
          : row.indexOf("topic") !== -1
          ? row.indexOf("topic")
          : -1;

      const romajiIndex = romaji !== -1 ? romaji : romajiFallback;
      if (kanji === -1 || romajiIndex === -1 || lesson === -1) {
        return null;
      }

      return {
        headerRow: i,
        deutsch,
        japanisch,
        kanji,
        romaji: romajiIndex,
        lesson
      };
    }
  }

  return null;
}

function cellToString(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Datei fehlt." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  let rows: unknown[][] | null = null;
  let header: HeaderMap | null = null;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
    const headerMap = findHeader(sheetRows);
    if (headerMap) {
      rows = sheetRows;
      header = headerMap;
      break;
    }
  }

  if (!rows || !header) {
    return NextResponse.json(
      {
        error:
          "Kein Blatt mit erforderlichen Headern (Deutsch, Japanisch, Kanji, Romaji/Lautschrift, Lektion/Bereich)."
      },
      { status: 400 }
    );
  }

  const records: Array<{
    sourceText: string;
    targetKana: string;
    targetKanji: string;
    targetRomaji: string;
    lessonOrDomain: string;
    orderIndex: number;
  }> = [];
  const missingRows: number[] = [];

  for (let i = header.headerRow + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const sourceText = cellToString(row[header.deutsch]);
    const targetKana = cellToString(row[header.japanisch]);

    if (!sourceText && !targetKana) {
      break;
    }

    if (!sourceText || !targetKana) {
      continue;
    }

    const targetKanji = cellToString(row[header.kanji]);
    const targetRomaji = cellToString(row[header.romaji]);
    const lessonOrDomain = cellToString(row[header.lesson]);

    if (!targetKanji || !targetRomaji || !lessonOrDomain) {
      missingRows.push(i + 1);
      continue;
    }

    records.push({
      sourceText,
      targetKana,
      targetKanji,
      targetRomaji,
      lessonOrDomain,
      orderIndex: i - header.headerRow
    });
  }

  if (missingRows.length > 0) {
    return NextResponse.json(
      {
        error: `Fehlende Pflichtwerte in Zeilen: ${missingRows
          .slice(0, 10)
          .join(", ")}. Bitte Kanji, Romaji und Lektion/Bereich ausfuellen.`
      },
      { status: 400 }
    );
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "Keine Zeilen zum Import." }, { status: 400 });
  }

  await prisma.$transaction(
    records.map((record) =>
      prisma.vocabEntry.upsert({
        where: { sourceText_targetKana: { sourceText: record.sourceText, targetKana: record.targetKana } },
        update: {
          targetKanji: record.targetKanji,
          targetRomaji: record.targetRomaji,
          lessonOrDomain: record.lessonOrDomain,
          orderIndex: record.orderIndex
        },
        create: {
          sourceText: record.sourceText,
          targetKana: record.targetKana,
          targetKanji: record.targetKanji,
          targetRomaji: record.targetRomaji,
          lessonOrDomain: record.lessonOrDomain,
          orderIndex: record.orderIndex
        }
      })
    )
  );

  return NextResponse.json({ imported: records.length });
}
