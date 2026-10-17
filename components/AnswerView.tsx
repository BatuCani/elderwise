import type { Copy } from "@/app/copy";
import type { Answer, AnswerType, Lang } from "@/prompts/elderwise";
import { CardBody } from "./cards";
import { LinkCard, PlaceCard } from "./cards-extra";
import { AlertIcon, BookIcon, CalendarIcon, InfoIcon, ListIcon, PhoneIcon } from "./icons";

// Labels for the two newer card types ("place" and "link"), which app/copy.ts does not list yet.
const EXTRA_TEXT: Record<Lang, { place: string; link: string; open: string }> = {
  en: { place: "Show me the way", link: "Useful link", open: "Open" },
  de: { place: "Wegbeschreibung", link: "Nützlicher Link", open: "Öffnen" },
};

export function TypeIcon({ type, className }: { type: AnswerType; className?: string }) {
  if (type === "warning") return <AlertIcon className={`${className} text-warn`} />;
  if (type === "reminder") return <CalendarIcon className={`${className} text-moss`} />;
  if (type === "explain") return <BookIcon className={`${className} text-moss`} />;
  if (type === "steps") return <ListIcon className={`${className} text-moss`} />;
  return <InfoIcon className={`${className} text-moss`} />;
}

type Props = { answer: Answer; t: Copy; phone: string; time: string; lang: Lang; at: number };

// One answer as a big visual card, then the "You learned" card.
// Warnings keep the red card below; every other type uses its own card from components/cards.
export function AnswerView({ answer, t, phone, time, lang, at }: Props) {
  const { type, headline, sentence, points, action } = answer;
  const warning = type === "warning";
  const kind = (t.kinds as Record<string, string>)[type] ?? (type === "place" ? EXTRA_TEXT[lang].place : EXTRA_TEXT[lang].link);
  // Place and link cards bring their own glass card. Without usable data they fall back to the normal card.
  const place = type === "place" && answer.place?.name ? answer.place : null;
  const link = type === "link" && answer.link && /^https:\/\//i.test(answer.link.url) ? answer.link : null;
  const extra = place !== null || link !== null;

  return (
    <section className="flex flex-col gap-3">
      <div
        className={`rounded-3xl ${extra ? "" : "p-6"} ${
          warning ? "bg-warn text-white shadow-[0_16px_40px_rgba(142,36,36,0.35)]" : extra ? "" : "bg-white text-ink"
        }`}
      >
        {place ? (
          <>
            <PlaceCard name={place.name} address={place.address ?? undefined} kicker={`${kind} · ${time}`} />
            {sentence && <p className="mt-4 px-2 text-xl leading-snug text-ink">{sentence}</p>}
          </>
        ) : link ? (
          <LinkCard title={link.title} sentence={sentence} href={link.url} kicker={`${kind} · ${time}`} buttonLabel={EXTRA_TEXT[lang].open} />
        ) : !warning ? (
          <CardBody answer={answer} kicker={`${kind} · ${time}`} lang={lang} at={at} />
        ) : (
        <>
        <p className={`mb-3 text-base font-bold uppercase tracking-[0.08em] ${warning ? "text-white/85" : "text-muted"}`}>
          {t.kinds[type]} · {time}
        </p>
        <div className="flex items-start gap-3">
          {warning ? <AlertIcon className="mt-1 h-9 w-9 shrink-0" /> : <TypeIcon type={type} className="mt-1 h-9 w-9 shrink-0" />}
          <h2 className="font-serif text-3xl font-medium leading-tight">{headline}</h2>
        </div>
        <p className="mt-4 text-xl leading-snug">{sentence}</p>
        {points.length > 0 && (
          <ol className="mt-5 flex flex-col gap-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    warning ? "bg-white text-warn" : "bg-moss text-white"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="pt-1 text-lg leading-snug">{p}</span>
              </li>
            ))}
          </ol>
        )}
        </>
        )}
        {action && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className={`mt-6 flex min-h-14 items-center justify-center gap-2 rounded-[28px] px-5 py-3 text-center text-lg font-bold ${
              warning ? "bg-white text-warn" : "bg-moss text-white"
            }`}
          >
            <PhoneIcon className="h-6 w-6 shrink-0" />
            {action.label}
          </a>
        )}
      </div>

      <div className="glass-moss rounded-3xl p-5 text-learn">
        <p className="text-lg font-bold">{t.learned}</p>
        <p className="mt-1 text-lg leading-snug">{answer.learned}</p>
        <p className="mt-2 text-lg leading-snug">{answer.tip}</p>
      </div>
    </section>
  );
}
