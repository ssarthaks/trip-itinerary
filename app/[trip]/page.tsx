import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes, trips } from "@/data/trips";
import type { Trip } from "@/data/types";
import TripPage from "@/components/TripPage";

type Params = { trip: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(trips).map((trip) => ({ trip }));
}

const isTrip = (slug: string): slug is Trip["slug"] => slug in trips;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trip } = await params;
  if (!isTrip(trip)) return {};
  const t = trips[trip];
  return {
    title: `${t.title} — ${t.name} itinerary`,
    description: `${t.tagline} A 4-day motorbike itinerary from Kathmandu on a Yamaha MT-15 and a Hero XPulse 200 4V.`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { trip } = await params;
  if (!isTrip(trip)) notFound();
  return <TripPage trip={trips[trip]} route={routes[trip]} />;
}
