"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type VocabEntry = {
  id: string;
  lessonOrDomain: string;
};

export default function PracticeBuilderPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [direction, setDirection] = useState("DE_JA");
  const [count, setCount] = useState(20);
  const [lessonFilter, setLessonFilter] = useState("");
  const [japaneseDisplay, setJapaneseDisplay] = useState<"kana" | "kanji">("kana");
  const [showRomaji, setShowRomaji] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/vocab", { cache: "no-store" });
      const data = await res.json();
      setEntries(data.entries ?? []);
    };
    load();
  }, []);

  const lessonSuggestions = useMemo(() => {
    const lessons = new Set<string>();
    entries.forEach((entry) => {
      const value = entry.lessonOrDomain?.trim();
      if (value) lessons.add(value);
    });
    return Array.from(lessons.values()).sort();
  }, [entries]);

  const handleCreate = async () => {
    setStatus("");
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction,
        count,
        lessonFilter: lessonFilter.trim(),
        japaneseDisplay,
        showRomaji
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error ?? "Arbeitsblatt konnte nicht erstellt werden.");
      return;
    }

    router.push(`/practice/${data.sheet.id}`);
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
              Arbeitsblatt-Generator
            </p>
            <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide text-[color:var(--text-main)]">
              Arbeitsblatt in zwei Schritten erstellen.
            </h1>
            <p className="mt-2 text-sm text-[color:var(--text-sub)]">
              {entries.length} Eintraege verfuegbar.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/" className="pill pill-ghost">
              Start
            </Link>
            <Link href="/vocab" className="pill pill-ghost">
              Vokabelliste
            </Link>
          </nav>
        </header>

        <section className="card surface-white p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-main)]">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                Richtung
              </span>
              <select
                className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[var(--bg-white)] px-3 py-2"
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
              >
                <option value="DE_JA">Deutsch {"->"} Japanisch</option>
                <option value="JA_DE">Japanisch {"->"} Deutsch</option>
                <option value="MIXED">Deutsch {"<->"} Japanisch (Gemischt)</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-main)]">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                Anzahl
              </span>
              <input
                type="number"
                min={1}
                className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[var(--bg-white)] px-3 py-2"
                value={count}
                onChange={(event) => setCount(Number(event.target.value) || 1)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-main)]">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                Lektion/Bereich-Filter
              </span>
              <input
                list="lesson-suggestions"
                className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[var(--bg-white)] px-3 py-2"
                value={lessonFilter}
                onChange={(event) => setLessonFilter(event.target.value)}
                placeholder="z.B. Unterwegs"
              />
              <datalist id="lesson-suggestions">
                {lessonSuggestions.map((lesson) => (
                  <option key={lesson} value={lesson} />
                ))}
              </datalist>
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[color:var(--text-main)]">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                Japanisch anzeigen
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`pill ${japaneseDisplay === "kana" ? "pill-primary" : "pill-ghost"}`}
                  onClick={() => setJapaneseDisplay("kana")}
                >
                  Kana
                </button>
                <button
                  type="button"
                  className={`pill ${japaneseDisplay === "kanji" ? "pill-primary" : "pill-ghost"}`}
                  onClick={() => setJapaneseDisplay("kanji")}
                >
                  Kanji
                </button>
              </div>
            </label>
            <label className="flex items-center gap-3 text-sm text-[color:var(--text-main)]">
              <input
                type="checkbox"
                className="h-4 w-4 border border-[color:var(--border)]"
                checked={showRomaji}
                onChange={(event) => setShowRomaji(event.target.checked)}
              />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
                Romaji anzeigen
              </span>
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="pill pill-primary"
              onClick={handleCreate}
            >
              Arbeitsblatt erstellen
            </button>
            {status && (
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-sub)]">
                {status}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
