import type { Metadata } from "next";

// Absolute URL of the deployed site, needed for canonical links and social
// previews. On Vercel it's picked up from the build environment; set
// NEXT_PUBLIC_SITE_URL to override it (e.g. once a custom domain is added).
const vercelHost =
  process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
);

export const siteName = "Sarthak & Rahul · Ride Itineraries";
export const authors = [{ name: "Sarthak Sharma" }, { name: "Rahul" }];

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image: { url: string; alt: string };
};

/** Full page metadata, including Open Graph and Twitter cards. */
export function pageMetadata({ title, description, path, image }: PageSeo): Metadata {
  const images = [{ url: image.url, width: 1200, height: 630, alt: image.alt, type: "image/jpeg" }];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: path,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
