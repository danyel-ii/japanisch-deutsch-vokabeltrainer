import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="card surface flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="label text-xs uppercase tracking-[0.3em] text-[color:var(--text-sub)]">
              Vokabel-Arbeitsblatt
            </p>
            <h1 className="font-head mt-3 text-4xl text-[color:var(--ink-primary)]">
              Ein druckfertiger Arbeitsblatt-Generator fuer Deutsch -> Japanisch.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-sub)]">
              Verwalte deine Vokabelliste, erstelle Arbeitsblaetter, uebe und drucke sie im
              tabellenbasierten Stil.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link
              className="pill pill-ghost bg-white"
              href="/vocab"
            >
              Vokabelliste
            </Link>
            <Link
              className="pill pill-primary"
              href="/practice/new"
            >
              Arbeitsblatt erstellen
            </Link>
          </nav>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Vokabeln verwalten",
              body: "Deutsch, Japanisch (Kana), Kanji und Romaji in einer Liste pflegen.",
              tone: "surface-blue"
            },
            {
              title: "Arbeitsblatt-Generator",
              body: "Richtung, Anzahl und Lektion/Bereich waehlen und ein Arbeitsblatt erstellen.",
              tone: "surface-pink"
            },
            {
              title: "Druckfertig",
              body: "Ink-Modus fuer sauberen A4-Druck und PDF-Export.",
              tone: "surface-green"
            }
          ].map((card) => (
            <div key={card.title} className={`card ${card.tone} p-6`}>
              <h2 className="font-head text-2xl text-[color:var(--ink-primary)]">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--text-sub)]">{card.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
