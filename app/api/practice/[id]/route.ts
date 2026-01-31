import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();
  const sheet = await prisma.practiceSheet.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { order: "asc" } } }
  });

  if (!sheet) {
    return NextResponse.json({ error: "Arbeitsblatt nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ sheet });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();
  try {
    await prisma.practiceSheet.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Arbeitsblatt konnte nicht geloescht werden." },
      { status: 404 }
    );
  }
}
