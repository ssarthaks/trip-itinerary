import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes, trips } from "@/data/trips";
import type { Trip } from "@/data/types";
import TripPage from "@/components/TripPage";
import JsonLd from "@/components/JsonLd";
import { tripJsonLd, tripSeo } from "@/data/seo";
import { pageMetadata } from "@/lib/site";

type Params = { trip: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(trips).map((trip) => ({ trip }));
}

const isTrip = (slug: string): slug is Trip["slug"] => slug in trips;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trip } = await params;
  if (!isTrip(trip)) return {};
  return pageMetadata(tripSeo[trip]);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { trip } = await params;
  if (!isTrip(trip)) notFound();
  return (
    <>
      <JsonLd data={tripJsonLd(trips[trip], routes[trip])} />
      <TripPage trip={trips[trip]} route={routes[trip]} />
    </>
  );
}
