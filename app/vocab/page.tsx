"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type VocabEntry = {
  id: string;
  orderIndex: number;
  sourceText: string;
  targetKana: string;
  targetKanji: string;
  targetRomaji: string;
  lessonOrDomain: string;
};

type FormState = {
  sourceText: string;
  targetKana: string;
  targetKanji: string;
  targetRomaji: string;
  lessonOrDomain: string;
};

type TouchedState = {
  targetKana: boolean;
  targetKanji: boolean;
  targetRomaji: boolean;
  lessonOrDomain: boolean;
};

const emptyForm: FormState = {
  sourceText: "",
  targetKana: "",
  targetKanji: "",
  targetRomaji: "",
  lessonOrDomain: ""
};

export default function VocabPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState("");
  const [touched, setTouched] = useState<TouchedState>({
    targetKana: false,
    targetKanji: false,
    targetRomaji: false,
    lessonOrDomain: false
  });
  const lastAutoSource = useRef("");
  const [showGerman, setShowGerman] = useState(true);
  const [showKana, setShowKana] = useState(true);
  const [showKanji, setShowKanji] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [sortBy, setSortBy] = useState<"nummer" | "deutsch">("nummer");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const lessonCacheKey = "vocab.lessonOrDomain";

  const loadEntries = async () => {
    const res = await fetch("/api/vocab", { cache: "no-store" });
    const data = await res.json();
    setEntries(data.entries ?? []);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const cached = window.localStorage.getItem(lessonCacheKey);
    if (cached && !form.lessonOrDomain) {
      setForm((prev) => ({ ...prev, lessonOrDomain: cached }));
    }
  }, []);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field !== "sourceText") {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
    if (field === "lessonOrDomain") {
      window.localStorage.setItem(lessonCacheKey, value);
    }
  };

  const resetForm = () => {
    const cachedLesson = window.localStorage.getItem(lessonCacheKey) ?? "";
    setForm({ ...emptyForm, lessonOrDomain: cachedLesson });
    setEditingId(null);
    setTouched({
      targetKana: false,
      targetKanji: false,
      targetRomaji: false,
      lessonOrDomain: false
    });
    setAutoError("");
    lastAutoSource.current = "";
  };

  const handleSubmit = async () => {
    setStatus("");
    const payload = {
      ...form,
      sourceText: form.sourceText.trim(),
      targetKana: form.targetKana.trim(),
      targetKanji: form.targetKanji.trim(),
      targetRomaji: form.targetRomaji.trim(),
      lessonOrDomain: form.lessonOrDomain.trim()
    };

    const res = await fetch("/api/vocab", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload)
    });

    if (res.ok) {
      window.localStorage.setItem(lessonCacheKey, form.lessonOrDomain.trim());
      await loadEntries();
      resetForm();
      setStatus(editingId ? "Eintrag aktualisiert." : "Eintrag hinzugefuegt.");
    } else {
      const data = await res.json();
      setStatus(data.error ?? "Etwas ist schiefgelaufen.");
    }
  };

  const handleEdit = (entry: VocabEntry) => {
    setEditingId(entry.id);
    setAutoError("");
    setAutoWarning("");
    setForm({
      sourceText: entry.sourceText,
      targetKana: entry.targetKana,
      targetKanji: entry.targetKanji,
      targetRomaji: entry.targetRomaji,
      lessonOrDomain: entry.lessonOrDomain
    });
    setTouched({
      targetKana: true,
      targetKanji: true,
      targetRomaji: true,
      lessonOrDomain: true
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Diesen Eintrag loeschen?")) return;
    const res = await fetch(`/api/vocab?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadEntries();
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import/xlsx", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error ?? "Import fehlgeschlagen.");
      } else {
        setStatus(`${data.imported ?? 0} Zeilen importiert.`);
        await loadEntries();
      }
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: "xlsx" | "ods") => {
    setExporting(true);
    setStatus("");
    try {
      const res = await fetch(`/api/export/vocab?format=${format}`);
      if (!res.ok) {
        const data = await res.json();
        setStatus(data.error ?? "Export fehlgeschlagen.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vokabeln-export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatus(`${format.toUpperCase()} exportiert.`);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (editingId) return;

    const sourceText = form.sourceText.trim();
    if (!sourceText) return;
    if (lastAutoSource.current === sourceText) return;

    const hasManualEdits =
      touched.targetKana ||
      touched.targetKanji ||
      touched.targetRomaji ||
      touched.lessonOrDomain;
    if (hasManualEdits) return;

    const timeout = setTimeout(async () => {
      setAutoLoading(true);
      setAutoError("");

      try {
        const res = await fetch("/api/ai/fill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceText })
        });
        const data = await res.json();

        if (!res.ok) {
          setAutoError(data.error ?? "Automatisches Ausfuellen fehlgeschlagen.");
          return;
        }

        setForm((prev) => ({
          ...prev,
          targetKana: data.targetKana ?? "",
          targetKanji: data.targetKanji ?? "",
          targetRomaji: data.targetRomaji ?? "",
          lessonOrDomain: data.lessonOrDomain ?? ""
        }));
        if (data.lessonOrDomain) {
          window.localStorage.setItem(lessonCacheKey, data.lessonOrDomain);
        }
        lastAutoSource.current = sourceText;
      } catch (error) {
        setAutoError("Automatisches Ausfuellen fehlgeschlagen.");
      } finally {
        setAutoLoading(false);
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [
    editingId,
    form.sourceText,
    form.targetKana,
    form.targetKanji,
    form.targetRomaji,
    form.lessonOrDomain,
    touched
  ]);

  const visibleColumnCount =
    [showGerman, showKana, showKanji, showRomaji].filter(Boolean).length + 3;

  const sortedEntries = [...entries].sort((a, b) => {
    let compare = 0;
    if (sortBy === "nummer") {
      compare = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    } else {
      compare = a.sourceText.localeCompare(b.sourceText, "de", { sensitivity: "base" });
    }
    return sortDir === "asc" ? compare : -compare;
  });

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
              Vokabelliste
            </p>
            <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide text-[#0d0d0d]">
              Deine Vokabelliste
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/" className="pill pill-ghost bg-white">
              Start
            </Link>
            <Link href="/practice/new" className="pill pill-primary">
              Neues Arbeitsblatt
            </Link>
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="card surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-[#0d0d0d]">
                Eintraege
              </h2>
              <p className="text-xs uppercase tracking-[0.3em] text-[#555555]">
                {entries.length} gesamt
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[11px] uppercase tracking-[0.2em] text-[#555555]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2">Spalten anzeigen</span>
                <button
                  type="button"
                  className={`pill ${showGerman ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setShowGerman((prev) => !prev)}
                >
                  Deutsch
                </button>
                <button
                  type="button"
                  className={`pill ${showKana ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setShowKana((prev) => !prev)}
                >
                  Kana
                </button>
                <button
                  type="button"
                  className={`pill ${showKanji ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setShowKanji((prev) => !prev)}
                >
                  Kanji
                </button>
                <button
                  type="button"
                  className={`pill ${showRomaji ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setShowRomaji((prev) => !prev)}
                >
                  Romaji
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2">Sortieren</span>
                <button
                  type="button"
                  className={`pill ${sortBy === "nummer" ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setSortBy("nummer")}
                >
                  Nummer
                </button>
                <button
                  type="button"
                  className={`pill ${sortBy === "deutsch" ? "pill-primary" : "pill-ghost bg-white"}`}
                  onClick={() => setSortBy("deutsch")}
                >
                  Deutsch
                </button>
                <button
                  type="button"
                  className="pill pill-ghost bg-white"
                  onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  {sortDir === "asc" ? "Aufsteigend" : "Absteigend"}
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.3em] text-[#555555]">
                  <tr>
                    <th className="px-3 py-2">Nummer</th>
                    {showGerman && <th className="px-3 py-2">Deutsch</th>}
                    {showKana && <th className="px-3 py-2">Japanisch</th>}
                    {showKanji && <th className="px-3 py-2">Kanji</th>}
                    {showRomaji && <th className="px-3 py-2">Romaji</th>}
                    <th className="px-3 py-2">Lektion/Bereich</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="rounded-xl border border-black/80 bg-[var(--bg-surface)] text-[#0d0d0d] transition hover:bg-white"
                    >
                      <td className="px-3 py-2 text-xs text-[#555555]">
                        {entry.orderIndex}
                      </td>
                      {showGerman && (
                        <td className="px-3 py-2 font-medium">{entry.sourceText}</td>
                      )}
                      {showKana && <td className="px-3 py-2">{entry.targetKana}</td>}
                      {showKanji && <td className="px-3 py-2">{entry.targetKanji}</td>}
                      {showRomaji && <td className="px-3 py-2">{entry.targetRomaji}</td>}
                      <td className="px-3 py-2 uppercase text-xs tracking-[0.2em]">
                        {entry.lessonOrDomain}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="pill pill-ghost bg-white"
                            onClick={() => handleEdit(entry)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            className="pill border border-black bg-[var(--bg-canvas)] text-[#0d0d0d]"
                            onClick={() => handleDelete(entry.id)}
                          >
                            Loeschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumnCount}
                        className="px-3 py-6 text-center text-sm text-[#555555]"
                      >
                        Fuegen Sie den ersten Eintrag hinzu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card surface-white p-6">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-[#0d0d0d]">
                {editingId ? "Eintrag bearbeiten" : "Eintrag hinzufuegen"}
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-[#0d0d0d]">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
                    Deutsch
                  </span>
                  <input
                    className="rounded-[var(--radius-sm)] border border-black/80 px-3 py-2"
                    value={form.sourceText}
                    onChange={(event) => handleChange("sourceText", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
                    Japanisch (Kana)
                  </span>
                  <input
                    className="rounded-[var(--radius-sm)] border border-black/80 px-3 py-2"
                    value={form.targetKana}
                    onChange={(event) => handleChange("targetKana", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
                    Kanji
                  </span>
                  <input
                    className="rounded-[var(--radius-sm)] border border-black/80 px-3 py-2"
                    value={form.targetKanji}
                    onChange={(event) => handleChange("targetKanji", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
                    Romaji
                  </span>
                  <input
                    className="rounded-[var(--radius-sm)] border border-black/80 px-3 py-2"
                    value={form.targetRomaji}
                    onChange={(event) => handleChange("targetRomaji", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
                    Lektion / Bereich
                  </span>
                  <input
                    className="rounded-[var(--radius-sm)] border border-black/80 px-3 py-2"
                    value={form.lessonOrDomain}
                    onChange={(event) => handleChange("lessonOrDomain", event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button className="pill pill-primary" onClick={handleSubmit}>
                  {editingId ? "Aktualisieren" : "Hinzufuegen"}
                </button>
                {editingId && (
                  <button
                    className="pill pill-ghost bg-white"
                    onClick={resetForm}
                  >
                    Abbrechen
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-[#555555]">
                {autoLoading && <p>Automatisch aus OpenAI ausfuellen...</p>}
                {autoError && <p className="text-red-600">{autoError}</p>}
                {status && <p>{status}</p>}
              </div>
            </div>

            <div className="card surface-white p-6">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-[#0d0d0d]">
                XLSX / ODS importieren
              </h2>
              <p className="mt-2 text-sm text-[#555555]">
                Lade die XLSX/ODS-Vorlage mit Deutsch-, Japanisch-, Kanji- und Romaji-Headern.
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <input
                  type="file"
                  accept=".xlsx,.ods"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                />
                {importing && <span className="text-xs text-[#555555]">Importiere...</span>}
              </div>
            </div>

            <div className="card surface-white p-6">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-[#0d0d0d]">
                XLSX / ODS exportieren
              </h2>
              <p className="mt-2 text-sm text-[#555555]">
                Exportiere die Vokabelliste im Tabellenformat.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="pill pill-primary"
                  onClick={() => handleExport("xlsx")}
                  disabled={exporting}
                >
                  XLSX exportieren
                </button>
                <button
                  type="button"
                  className="pill pill-ghost bg-white"
                  onClick={() => handleExport("ods")}
                  disabled={exporting}
                >
                  ODS exportieren
                </button>
              </div>
              {exporting && <p className="mt-2 text-xs text-[#555555]">Exportiere...</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
