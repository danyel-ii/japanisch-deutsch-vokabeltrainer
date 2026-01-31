import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getPrisma } from "@/lib/db";
import type { VocabEntry } from "@prisma/client";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ods: "application/vnd.oasis.opendocument.spreadsheet"
};

export async function GET(req: Request) {
  const prisma = getPrisma();
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "xlsx").toLowerCase();

  if (!contentTypes[format]) {
    return NextResponse.json({ error: "Unbekanntes Exportformat." }, { status: 400 });
  }

  const entries: VocabEntry[] = await prisma.vocabEntry.findMany({
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }]
  });

  const rows = [
    ["Deutsch", "Japanisch", "Kanji", "Romaji/Lautschrift", "Lektion/Bereich"],
    ...entries.map((entry) => [
      entry.sourceText,
      entry.targetKana,
      entry.targetKanji,
      entry.targetRomaji,
      entry.lessonOrDomain
    ])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vokabeln");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: format as "xlsx" | "ods" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentTypes[format],
      "Content-Disposition": `attachment; filename=\"vokabeln-export.${format}\"`
    }
  });
}
