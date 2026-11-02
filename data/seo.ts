import type { RouteData, Trip } from "./types";
import { absoluteUrl, authors, siteName, siteUrl } from "@/lib/site";

// Titles stay under ~60 characters and descriptions under ~160 so search
// results and social cards don't truncate them.
export const homeSeo = {
  title: "Kalinchowk or Mustang · 4-day Nepal motorbike rides",
  description:
    "Two 4-day motorbike itineraries from Kathmandu on an MT-15 and XPulse 200 4V: Kuri Village & Kalinchowk, or Lower Mustang & Muktinath.",
  path: "/",
  image: { url: "/og/home.jpg", alt: "Pick a ride: Kalinchowk or Mustang, two 4-day motorbike itineraries from Kathmandu" },
};

export const tripSeo: Record<Trip["slug"], typeof homeSeo> = {
  kalinchowk: {
    title: "Kuri & Kalinchowk · 4-day motorbike itinerary",
    description:
      "Kathmandu to Kuri Village, Kalinchowk Bhagwati (3,842 m), Dolakha and Jiri by motorbike: day-by-day plan, road map, elevation, budget and gear.",
    path: "/kalinchowk/",
    image: { url: "/og/kalinchowk.jpg", alt: "Kuri and the road to Kalinchowk: 4 days, 474 km, 3,842 m high point" },
  },
  mustang: {
    title: "Muktinath & Lower Mustang · 4-day motorbike itinerary",
    description:
      "Kathmandu to Tatopani, the Kali Gandaki gorge and Muktinath (3,710 m), back via Pokhara in 4 days: day-by-day plan, road map, elevation and budget.",
    path: "/mustang/",
    image: { url: "/og/mustang.jpg", alt: "Muktinath, chasing November snow: 4 days, 747 km, 3,710 m high point" },
  },
};

const people = authors.map((a) => ({ "@type": "Person", name: a.name }));

export function websiteJsonLd(trips: Trip[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: siteUrl.toString(),
        name: siteName,
        description: homeSeo.description,
        inLanguage: "en",
        author: people,
      },
      {
        "@type": "ItemList",
        name: "Motorbike itineraries",
        itemListElement: trips.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(tripSeo[t.slug].path),
          name: tripSeo[t.slug].title,
        })),
      },
    ],
  };
}

export function tripJsonLd(trip: Trip, route: RouteData) {
  const seo = tripSeo[trip.slug];
  const url = absoluteUrl(seo.path);

  // Stops in travel order, once each, with the summit after the stop it's walked from.
  const order: string[] = [];
  for (const m of route.marks) if (!order.includes(m.key)) order.push(m.key);
  order.splice(order.indexOf(trip.summit.via) + 1, 0, trip.summit.key);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${url}#trip`,
        name: seo.title,
        description: seo.description,
        url,
        image: [absoluteUrl(seo.image.url), absoluteUrl(trip.hero.src)],
        inLanguage: "en",
        touristType: "Motorcycle touring",
        author: people,
        itinerary: {
          "@type": "ItemList",
          numberOfItems: order.length,
          itemListElement: order.map((key, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Place",
              name: trip.stopNames[key] ?? key,
              geo: { "@type": "GeoCoordinates", latitude: route.stops[key][0], longitude: route.stops[key][1] },
            },
          })),
        },
        subTrip: trip.days.map((d) => ({
          "@type": "Trip",
          name: `Day ${d.n}: ${d.title.replace("→", "to")}`,
          description: d.summary,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Choose a ride", item: siteUrl.toString() },
          { "@type": "ListItem", position: 2, name: trip.name, item: url },
        ],
      },
    ],
  };
}
