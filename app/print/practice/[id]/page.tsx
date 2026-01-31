import { prisma } from "@/lib/db";

export default async function PrintPracticePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { mode?: string; answers?: string };
}) {
  const sheet = await prisma.practiceSheet.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { order: "asc" } } }
  });

  if (!sheet) {
    return (
      <main className="p-10">
        <p className="text-sm text-[#555555]">Arbeitsblatt nicht gefunden.</p>
      </main>
    );
  }

  const mode = searchParams?.mode === "ink" ? "ink" : "screen";
  const showAnswers = searchParams?.answers === "1";

  return (
    <main
      data-mode={mode}
      className={`min-h-screen w-full px-8 py-6 text-[var(--text-main)] ${
        mode === "ink" ? "bg-white" : "bg-[var(--bg-surface)]"
      }`}
    >
      <div className="print-page">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#555555]">
              Arbeitsblatt
            </p>
            <h1 className="mt-2 text-2xl font-semibold uppercase tracking-wide text-[#0d0d0d]">
              {sheet.direction === "MIXED"
                ? "Deutsch <-> Japanisch"
                : sheet.direction === "DE_JA"
                ? "Deutsch -> Japanisch"
                : "Japanisch -> Deutsch"}
            </h1>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.2em] text-[#555555]">
            <p>{new Date(sheet.createdAt).toLocaleDateString()}</p>
            {sheet.lessonFilter && <p>Lektion: {sheet.lessonFilter}</p>}
            <p>{sheet.count} Eintraege</p>
          </div>
        </header>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-black bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.3em] text-[#555555]">
              <tr>
                <th className="border-b border-black px-4 py-2">#</th>
                <th className="border-b border-black px-4 py-2">Vorgabe</th>
                <th className="border-b border-black px-4 py-2">Antwort</th>
              </tr>
            </thead>
            <tbody>
              {sheet.items.map((item) => {
                const japaneseValue =
                  sheet.japaneseDisplay === "kanji" ? item.answerKanji : item.answerKana;
                const japaneseWithRomaji = sheet.showRomaji
                  ? `${japaneseValue} (${item.answerRomaji})`
                  : japaneseValue;
                return (
                  <tr key={item.id} className="border-b border-black last:border-b-0">
                    <td className="px-4 py-3 text-xs text-[#555555]">{item.order}</td>
                    <td className="px-4 py-3 font-medium text-[#0d0d0d]">{item.promptText}</td>
                    <td className="px-4 py-3 text-[#0d0d0d]">
                      {showAnswers ? (
                        item.promptLanguage === "DE" ? (
                          <span>{japaneseWithRomaji}</span>
                        ) : (
                          item.answerText
                        )
                      ) : (
                        <span className="block h-6 w-full border-b border-black"></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
