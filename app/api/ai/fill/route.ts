import { NextResponse } from "next/server";

export const runtime = "nodejs";

function extractOutputText(payload: any) {
  if (!payload || !Array.isArray(payload.output)) return "";

  for (const item of payload.output) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part?.type === "refusal" && typeof part.refusal === "string") {
          continue;
        }
        if (part?.type === "output_text" && typeof part.text === "string") {
          const text = part.text.trim();
          if (text) return text;
        }
      }
    }
  }

  return "";
}

function extractRefusal(payload: any) {
  if (!payload || !Array.isArray(payload.output)) return "";
  for (const item of payload.output) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part?.type === "refusal" && typeof part.refusal === "string") {
          const text = part.refusal.trim();
          if (text) return text;
        }
      }
    }
  }
  return "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const sourceText = typeof body.sourceText === "string" ? body.sourceText.trim() : "";

  if (!sourceText) {
    return NextResponse.json({ error: "sourceText ist erforderlich." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY ist nicht konfiguriert." },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_output_tokens: 300,
      input: [
        {
          role: "system",
          content:
            "You generate Japanese study metadata for German vocabulary. Respond with accurate Japanese readings. Lesson/domain labels must be in German."
        },
        {
          role: "user",
          content: `For the German word or phrase: "${sourceText}", provide:\n- targetKana: Japanese reading in kana (required)\n- targetKanji: kanji form (required)\n- targetRomaji: romaji reading (required)\n- lessonOrDomain: 1 short label in German (required)\nIf any field cannot be identified with confidence, return an empty string for that field. Do not guess.`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "vocab_autofill",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              targetKana: { type: "string" },
              targetKanji: { type: "string" },
              targetRomaji: { type: "string" },
              lessonOrDomain: { type: "string" }
            },
            required: ["targetKana", "targetKanji", "targetRomaji", "lessonOrDomain"]
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "OpenAI-Anfrage fehlgeschlagen.", detail: errorText },
      { status: 502 }
    );
  }

  const data = await response.json();
  const outputText = extractOutputText(data);
  const refusalText = extractRefusal(data);

  if (refusalText) {
    return NextResponse.json({ error: refusalText }, { status: 422 });
  }

  if (!outputText) {
    return NextResponse.json({ error: "OpenAI-Antwort war leer." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(outputText);
    const targetKana = String(parsed.targetKana ?? "").trim();
    const targetKanji = String(parsed.targetKanji ?? "").trim();
    const targetRomaji = String(parsed.targetRomaji ?? "").trim();
    const lessonOrDomain = String(parsed.lessonOrDomain ?? "").trim();

    const missing: string[] = [];
    if (!targetKana) missing.push("Japanisch (Kana)");
    if (!targetKanji) missing.push("Kanji");
    if (!targetRomaji) missing.push("Romaji");
    if (!lessonOrDomain) missing.push("Lektion/Bereich");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `OpenAI konnte Folgendes nicht ermitteln: ${missing.join(
            ", "
          )}. Bitte manuell ausfuellen.`
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      targetKana,
      targetKanji,
      targetRomaji,
      lessonOrDomain
    });
  } catch (error) {
    return NextResponse.json(
      { error: "OpenAI-Antwort konnte nicht verarbeitet werden." },
      { status: 502 }
    );
  }
}
