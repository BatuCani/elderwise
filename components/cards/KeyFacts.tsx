import type { Answer, Lang } from "@/prompts/elderwise";
import { LOCALE } from "@/lib/speech";

// The numbers that matter in an answer, pulled out so they are impossible to miss:
// amounts from a bill or receipt as a small table with a total, dates, times and percentages as big chips.

const TEXT: Record<Lang, { total: string; facts: string; amounts: string }> = {
  en: { total: "Total", facts: "Key facts", amounts: "Amounts" },
  de: { total: "Gesamt", facts: "Das Wichtigste", amounts: "Beträge" },
};

const MONEY = /(?:€\s?\d[\d.,]*\d|\d[\d.,]*\s?(?:€|EUR\b|Euro\b))/i;
const MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mär|Mai|Okt|Dez";
const FACT = new RegExp(
  [
    MONEY.source,
    String.raw`\b\d{1,2}\.\d{1,2}\.(?:\d{2,4})?`,
    String.raw`\b\d{1,2}(?:st|nd|rd|th|\.)?\s+(?:${MONTHS})[a-zä]*(?:\s+\d{4})?`,
    String.raw`\b(?:${MONTHS})[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?`,
    String.raw`\b\d{1,2}:\d{2}(?:\s?(?:am|pm|Uhr))?`,
    String.raw`\b\d+(?:[.,]\d+)?\s?%`,
  ].join("|"),
  "gi",
);

// "1.234,56 €", "€12.50", "42,50 EUR" -> 1234.56, 12.5, 42.5
export function parseMoney(text: string): number | null {
  const raw = text.replace(/[^\d.,]/g, "");
  const last = Math.max(raw.lastIndexOf(","), raw.lastIndexOf("."));
  const decimals = last >= 0 && raw.length - last - 1 <= 2 ? raw.slice(last + 1) : "";
  const whole = (decimals ? raw.slice(0, last) : raw).replace(/[.,]/g, "");
  const n = Number(`${whole}.${decimals || "0"}`);
  return Number.isFinite(n) ? n : null;
}

type Row = { label: string; value: number };

function amountRows(points: string[]): Row[] {
  const rows: Row[] = [];
  for (const p of points) {
    const m = p.match(MONEY);
    const value = m ? parseMoney(m[0]) : null;
    if (!m || value === null) continue;
    const label = p.replace(m[0], "").replace(/\s+/g, " ").replace(/^[\s:–-]+|[\s:–-]+$/g, "").trim();
    rows.push({ label: label || "-", value });
  }
  return rows;
}

export function KeyFacts({ answer, lang, warning = false }: { answer: Answer; lang: Lang; warning?: boolean }) {
  const L = TEXT[lang];
  const money = new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "EUR" });
  const rows = amountRows(answer.points);
  const table = rows.length >= 2;
  // The reminder card already shows its date as a calendar; there the chips only add what is left.
  const seen = new Set<string>();
  const chips: string[] = [];
  for (const m of `${answer.headline} ${answer.sentence} ${answer.points.join(" ")}`.matchAll(FACT)) {
    const chip = m[0].trim();
    const key = chip.toLowerCase();
    if (seen.has(key) || (table && MONEY.test(chip))) continue;
    if (answer.type === "reminder" && answer.when?.toLowerCase().includes(key)) continue;
    seen.add(key);
    chips.push(chip);
  }
  const named = rows.find((r) => /total|gesamt|summe|sum\b/i.test(r.label));
  const items = named ? rows.filter((r) => r !== named) : rows;
  const total = named?.value ?? items.reduce((s, r) => s + r.value, 0);

  if (!table && chips.length === 0) return null;
  return (
    <div className="mt-5 flex flex-col gap-4">
      {chips.length > 0 && (
        <div>
          <p className="sr-only">{L.facts}</p>
          <ul className="flex flex-wrap gap-2">
            {chips.slice(0, 4).map((c, i) => (
              <li
                key={c}
                className={`chip-in rounded-2xl px-4 py-2 font-serif text-2xl font-medium leading-tight ${
                  warning ? "bg-white text-warn" : "bg-learn-bg text-learn"
                }`}
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {table && (
        <table className={`w-full overflow-hidden rounded-2xl text-left text-lg ${warning ? "bg-white/12" : "bg-paper"}`}>
          <caption className="sr-only">{L.amounts}</caption>
          <tbody>
            {items.map((r, i) => (
              <tr key={i} className="row-in" style={{ animationDelay: `${200 + i * 80}ms` }}>
                <th scope="row" className="px-4 pt-3 font-normal leading-snug">{r.label}</th>
                <td className="whitespace-nowrap px-4 pt-3 text-right font-bold tabular-nums">{money.format(r.value)}</td>
              </tr>
            ))}
            <tr className={`row-in border-t-2 ${warning ? "border-white/30" : "border-line"}`} style={{ animationDelay: `${200 + items.length * 80}ms` }}>
              <th scope="row" className="px-4 py-3 font-bold">{L.total}</th>
              <td className="whitespace-nowrap px-4 py-3 text-right font-serif text-2xl font-medium tabular-nums">{money.format(total)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
