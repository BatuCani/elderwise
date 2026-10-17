import type { ReactNode } from "react";

// "Show me the way": a place from an answer (pharmacy, doctor, address) with a map and a transit route.
type Props = {
  name: string;
  address?: string;
  kicker?: string;
  // The small animated map picture from components/cards/CardArt.tsx.
  art?: ReactNode;
};

const PinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
const MapIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);
const BusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <rect x="5" y="3" width="14" height="15" rx="3" />
    <path d="M5 11h14M8 21v-3M16 21v-3" />
    <circle cx="8.5" cy="14.5" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="14.5" r="0.6" fill="currentColor" />
  </svg>
);

export function mapUrl(place: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

export function directionsUrl(place: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}&travelmode=transit`;
}

export function PlaceCard({ name, address, kicker = "Show me the way", art }: Props) {
  const query = address ? `${name}, ${address}` : name;
  const button =
    "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-[28px] px-5 py-3 text-center text-xl font-bold";

  return (
    <section className="glass rounded-3xl p-6 text-ink">
      {art}
      <p className="mb-3 text-base font-bold uppercase tracking-[0.08em] text-muted">{kicker}</p>
      <div className="flex items-start gap-3">
        <PinIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />
        <div className="min-w-0">
          <h2 className="font-serif text-3xl font-medium leading-tight">{name}</h2>
          {address && <p className="mt-2 text-xl leading-snug text-muted">{address}</p>}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <a href={mapUrl(query)} target="_blank" rel="noopener noreferrer" className={`${button} glass text-moss`}>
          <MapIcon className="h-6 w-6 shrink-0" />
          Show on map
        </a>
        <a href={directionsUrl(query)} target="_blank" rel="noopener noreferrer" className={`${button} bg-moss text-white`}>
          <BusIcon className="h-6 w-6 shrink-0" />
          Directions
        </a>
      </div>
    </section>
  );
}
