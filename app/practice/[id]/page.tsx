"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { normalizeGerman, normalizeJapanese } from "@/lib/normalize";

type PracticeItem = {
  id: string;
  promptText: string;
  promptLanguage: "DE" | "JA";
  answerKana: string;
  answerKanji: string;
  answerRomaji: string;
  answerText: string;
  order: number;
};

type PracticeSheet = {
  id: string;
  direction: "DE_JA" | "JA_DE" | "MIXED";
  count: number;
  lessonFilter: string | null;
  japaneseDisplay: "kana" | "kanji";
  showRomaji: boolean;
  items: PracticeItem[];
};

export default function PracticeSheetPage() {
  const params = useParams();
  const id = params?.id as string;

  const [sheet, setSheet] = useState<PracticeSheet | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/practice/${id}`, { cache: "no-store" });
      const data = await res.json();
      setSheet(data.sheet ?? null);
    };

    if (id) {
      load();
    }
  }, [id]);

  const handleCheck = () => {
    if (!sheet) return;
    const nextChecked: Record<string, boolean> = {};

    sheet.items.forEach((item) => {
      const userInput = answers[item.id] ?? "";
      if (item.promptLanguage === "DE") {
        const normalized = normalizeJapanese(userInput);
        const kana = normalizeJapanese(item.answerKana);
        const kanji = normalizeJapanese(item.answerKanji);
        nextChecked[item.id] = normalized.length > 0 && (normalized === kana || normalized === kanji);
      } else {
        const normalized = normalizeGerman(userInput);
        nextChecked[item.id] =
          normalized.length > 0 && normalized === normalizeGerman(item.answerText);
      }
    });

    setChecked(nextChecked);
    setStatus("Alle Zeilen geprueft.");
  };

  const handleExport = async () => {
    setStatus("PDF wird vorbereitet...");
    const res = await fetch(`/api/pdf/practice/${id}`);
    if (!res.ok) {
      setStatus("PDF-Export fehlgeschlagen.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `practice-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setStatus("PDF heruntergeladen.");
  };

  const summary = useMemo(() => {
    if (!sheet) return "";
    const directionLabel =
      sheet.direction === "MIXED"
        ? "DE <-> JA"
        : sheet.direction === "DE_JA"
        ? "DE -> JA"
        : "JA -> DE";
    return `${sheet.count} Eintraege - ${directionLabel}${
      sheet.lessonFilter ? ` - Lektion: ${sheet.lessonFilter}` : ""
    }`;
  }, [sheet]);

  if (!sheet) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-4xl text-sm text-[color:var(--text-sub)]">Laedt...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-xs uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
              Arbeitsblatt
            </p>
            <h1 className="font-head mt-2 text-4xl text-[color:var(--ink-primary)]">
              Trage die Antwort in die leere Spalte ein.
            </h1>
            <p className="mt-2 text-sm text-[color:var(--text-sub)]">{summary}</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/practice/new" className="pill pill-ghost bg-white">
              Neues Arbeitsblatt
            </Link>
            <Link href={`/print/practice/${sheet.id}`} className="pill pill-ghost bg-white">
              Druckansicht
            </Link>
          </nav>
        </header>

        <section className="card surface-pink sheet-grid p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="pill pill-primary"
              onClick={handleCheck}
            >
              Pruefen
            </button>
            <button
              className="pill pill-ghost bg-white"
              onClick={() => setReveal((prev) => !prev)}
            >
              {reveal ? "Loesungen ausblenden" : "Loesungen anzeigen"}
            </button>
            <button
              className="pill pill-ghost bg-white"
              onClick={handleExport}
            >
              PDF exportieren
            </button>
            {status && (
              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-sub)]">
                {status}
              </span>
            )}
          </div>

          <div className="mt-6 overflow-x-auto table-shell">
            <table className="data-table text-sm">
              <thead className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Vorgabe</th>
                  <th className="px-3 py-2">Antwort</th>
                  {reveal && <th className="px-3 py-2">Loesung</th>}
                </tr>
              </thead>
              <tbody>
                {sheet.items.map((item) => {
                  const isCorrect = checked[item.id];
                  const japaneseValue =
                    sheet.japaneseDisplay === "kanji" ? item.answerKanji : item.answerKana;
                  const japaneseWithRomaji =
                    sheet.showRomaji && item.answerRomaji
                      ? `${japaneseValue} (${item.answerRomaji})`
                      : japaneseValue;
                  return (
                    <tr
                      key={item.id}
                      className={`text-[color:var(--ink-primary)] ${
                        isCorrect === true
                          ? "bg-emerald-50"
                          : isCorrect === false
                          ? "bg-rose-50"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-xs text-[color:var(--text-sub)]">{item.order}</td>
                      <td
                        className={`px-3 py-2 font-medium text-[color:var(--ink-primary)] ${
                          item.promptLanguage === "JA" ? "font-jp" : ""
                        }`}
                      >
                        {item.promptText}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="answer-input"
                          value={answers[item.id] ?? ""}
                          onChange={(event) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [item.id]: event.target.value
                            }))
                          }
                        />
                        {isCorrect === true && (
                          <span className="mt-1 block text-xs font-semibold text-emerald-700 uppercase tracking-[0.2em]">
                            Richtig
                          </span>
                        )}
                        {isCorrect === false && (
                          <span className="mt-1 block text-xs font-semibold text-rose-700 uppercase tracking-[0.2em]">
                            Falsch
                          </span>
                        )}
                      </td>
                      {reveal && (
                        <td
                          className={`px-3 py-2 text-[color:var(--text-sub)] ${
                            item.promptLanguage === "DE" ? "font-jp" : ""
                          }`}
                        >
                          {item.promptLanguage === "DE" ? japaneseWithRomaji : item.answerText}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
