// A useful link from an answer (e.g. a prefilled flight search): title, one sentence, one big "Open" button.
type Props = {
  title: string;
  sentence: string;
  href: string;
  kicker?: string;
  buttonLabel?: string;
};

const LinkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </svg>
);
const OpenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export function flightsUrl(text: string) {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(text)}`;
}

export function LinkCard({ title, sentence, href, kicker = "Useful link", buttonLabel = "Open" }: Props) {
  return (
    <section className="glass rounded-3xl p-6 text-ink">
      <p className="mb-3 text-base font-bold uppercase tracking-[0.08em] text-muted">{kicker}</p>
      <div className="flex items-start gap-3">
        <LinkIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />
        <h2 className="font-serif text-3xl font-medium leading-tight">{title}</h2>
      </div>
      <p className="mt-4 text-xl leading-snug">{sentence}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-[28px] bg-moss px-5 py-3 text-center text-xl font-bold text-white"
      >
        {buttonLabel}
        <OpenIcon className="h-6 w-6 shrink-0" />
      </a>
    </section>
  );
}
