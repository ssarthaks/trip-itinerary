import type { MetadataRoute } from "next";
import { homeSeo, tripSeo } from "@/data/seo";
import { tripList } from "@/data/trips";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: absoluteUrl(homeSeo.path),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      images: [absoluteUrl(homeSeo.image.url)],
    },
    ...tripList.map((trip) => ({
      url: absoluteUrl(tripSeo[trip.slug].path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      images: [absoluteUrl(tripSeo[trip.slug].image.url), absoluteUrl(trip.hero.src)],
    })),
  ];
}
