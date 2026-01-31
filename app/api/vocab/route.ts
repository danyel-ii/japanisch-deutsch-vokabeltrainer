import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

function trimOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET() {
  const prisma = getPrisma();
  const entries = await prisma.vocabEntry.findMany({
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }]
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const body = await req.json();
  const sourceLanguage = trimOrNull(body.sourceLanguage) ?? "German";
  const sourceText = trimOrNull(body.sourceText);
  const targetLanguage = trimOrNull(body.targetLanguage) ?? "Japanese";
  const targetKana = trimOrNull(body.targetKana);
  const targetKanji = trimOrNull(body.targetKanji);
  const targetRomaji = trimOrNull(body.targetRomaji);
  const lessonOrDomain = trimOrNull(body.lessonOrDomain);
  const orderIndex =
    typeof body.orderIndex === "number" && Number.isFinite(body.orderIndex)
      ? Math.floor(body.orderIndex)
      : null;

  if (!sourceText || !targetKana || !targetKanji || !targetRomaji || !lessonOrDomain) {
    return NextResponse.json(
      {
        error:
          "Pflichtfelder fehlen: sourceText, targetKana, targetKanji, targetRomaji, lessonOrDomain."
      },
      { status: 400 }
    );
  }

  let nextOrderIndex = orderIndex;
  if (nextOrderIndex == null) {
    const maxOrder = await prisma.vocabEntry.aggregate({
      _max: { orderIndex: true }
    });
    nextOrderIndex = (maxOrder._max.orderIndex ?? 0) + 1;
  }

  try {
    const entry = await prisma.vocabEntry.create({
      data: {
        sourceLanguage: sourceLanguage || "German",
        sourceText,
        targetLanguage: targetLanguage || "Japanese",
        targetKana,
        targetKanji,
        targetRomaji,
        lessonOrDomain,
        orderIndex: nextOrderIndex
      }
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Eintrag konnte nicht erstellt werden. Moeglicherweise existiert er bereits." },
      { status: 409 }
    );
  }
}

export async function PUT(req: Request) {
  const prisma = getPrisma();
  const body = await req.json();
  const id = trimOrNull(body.id);

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const sourceLanguage = trimOrNull(body.sourceLanguage);
  const sourceText = trimOrNull(body.sourceText);
  const targetLanguage = trimOrNull(body.targetLanguage);
  const targetKana = trimOrNull(body.targetKana);
  const targetKanji = trimOrNull(body.targetKanji);
  const targetRomaji = trimOrNull(body.targetRomaji);
  const lessonOrDomain = trimOrNull(body.lessonOrDomain);
  const orderIndex =
    typeof body.orderIndex === "number" && Number.isFinite(body.orderIndex)
      ? Math.floor(body.orderIndex)
      : null;

  if (!sourceText || !targetKana || !targetKanji || !targetRomaji || !lessonOrDomain) {
    return NextResponse.json(
      {
        error:
          "Pflichtfelder fehlen: sourceText, targetKana, targetKanji, targetRomaji, lessonOrDomain."
      },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.vocabEntry.update({
      where: { id },
      data: {
        sourceLanguage: sourceLanguage ?? undefined,
        sourceText,
        targetLanguage: targetLanguage ?? undefined,
        targetKana,
        targetKanji,
        targetRomaji,
        lessonOrDomain,
        orderIndex: orderIndex ?? undefined
      }
    });

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: "Eintrag konnte nicht aktualisiert werden." }, { status: 404 });
  }
}

export async function DELETE(req: Request) {
  const prisma = getPrisma();
  const url = new URL(req.url);
  let id = url.searchParams.get("id");

  if (!id) {
    try {
      const body = await req.json();
      id = typeof body.id === "string" ? body.id : null;
    } catch (error) {
      id = null;
    }
  }

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  try {
    await prisma.vocabEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Eintrag konnte nicht geloescht werden." }, { status: 404 });
  }
}
