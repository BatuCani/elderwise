import { flightsUrl, LinkCard, PlaceCard } from "@/components/cards-extra";

// Preview of the "Show me the way" cards with invented example data, so they can be reviewed before wiring them in.
export default function DemoCardsPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-8">
      <h1 className="font-serif text-4xl font-medium text-ink">Demo cards</h1>
      <PlaceCard name="Linden Pharmacy" address="Hermannplatz 1, 10967 Berlin" />
      <PlaceCard name="Praxis Dr. Weber" address="Example Street 12, 10115 Berlin" kicker="Your doctor" />
      <LinkCard
        title="Flights to Mallorca"
        sentence="Here are flights from Berlin to Palma in May, already filled in for you."
        href={flightsUrl("Flights from Berlin to Palma de Mallorca in May")}
      />
    </main>
  );
}
