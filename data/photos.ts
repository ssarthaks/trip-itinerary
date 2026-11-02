import type { Photo } from "./types";
import webCredits from "@/public/images/web/credits.json";
import mustangCredits from "@/public/images/mustang/credits.json";

export type Credit = {
  file: string;
  subject: string;
  title: string;
  author: string;
  license: string;
  source: string;
  width: number;
  height: number;
  alt: string;
};

const folders = {
  web: webCredits as Credit[],
  mustang: mustangCredits as Credit[],
};

/** A Wikimedia Commons photo, looked up in its folder's credits.json. */
export function commons(folder: keyof typeof folders, file: string): Photo {
  const credit = folders[folder].find((c) => c.file === file);
  if (!credit) throw new Error(`No credit entry for images/${folder}/${file}`);
  return {
    src: `/images/${folder}/${file}`,
    alt: credit.alt,
    width: credit.width,
    height: credit.height,
  };
}

/** Photos we supplied ourselves (not from Commons, so not in the credits list). */
export const ours = {
  blueSky: {
    src: "/images/ours/kuri-blue-sky.jpg",
    alt: "Snow-covered Kuri village with blue and red roofs under a deep blue sky",
    width: 515,
    height: 388,
  },
  village: {
    src: "/images/ours/kuri-village.jpg",
    alt: "Colourful lodges of Kuri village beneath a snowy rock face",
    width: 843,
    height: 1124,
  },
  aerial: {
    src: "/images/ours/kuri-aerial.jpg",
    alt: "Kuri village seen from the Kalinchowk ridge with hazy hills beyond",
    width: 480,
    height: 640,
  },
  houses: {
    src: "/images/ours/kuri-houses.jpg",
    alt: "Blue, orange and red houses on a snowy hillside in Kuri",
    width: 547,
    height: 365,
  },
  mt15: {
    src: "/images/web/mt15.jpg",
    alt: "Black Yamaha MT-15 with red wheels parked on a dry hillside",
    width: 1672,
    height: 941,
  },
} satisfies Record<string, Photo>;

export const allCredits = [
  ...folders.web.map((c) => ({ ...c, folder: "web" as const })),
  ...folders.mustang.map((c) => ({ ...c, folder: "mustang" as const })),
];
