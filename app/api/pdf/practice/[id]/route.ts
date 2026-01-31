import { NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const host = req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return NextResponse.json({ error: "Host-Header fehlt." }, { status: 400 });
  }

  const printUrl = `${protocol}://${host}/print/practice/${params.id}?mode=ink&answers=1`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print" });
    await page.goto(printUrl, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: false,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" }
    });

    const body = new Uint8Array(pdfBuffer);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"practice-${params.id}.pdf\"`
      }
    });
  } finally {
    await browser.close();
  }
}
