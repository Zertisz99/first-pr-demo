import { getAllAthletes } from "@/lib/athletes";
import DiscoverResults from "@/components/discover/DiscoverResults";

export default async function DiscoverPage() {
  const athletes = await getAllAthletes();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          Discover athletes
        </h1>
        <p className="mt-1 max-w-[60ch] font-body text-sm text-fg-muted">
          Search verified profiles across every sport hub. Every view is logged and
          visible to the athlete.
        </p>
      </div>
      <DiscoverResults athletes={athletes} />
    </div>
  );
}
