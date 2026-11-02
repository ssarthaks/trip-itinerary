export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Stat = { value: string; label: string };

export type Day = {
  n: 1 | 2 | 3 | 4;
  weekday?: string;
  title: string;
  kicker: string;
  summary: string;
  chain: string[];
  stats: Stat[];
  highlights: string[];
  night: string;
  note?: { label: string; text: string };
  photos: [Photo, Photo, Photo];
};

export type BudgetRow = {
  category: string;
  low: number;
  high: number;
  note: string;
};

export type Budget = {
  /** Whether the amounts are for both riders together or for each rider. */
  basis: "pair" | "rider";
  /** What the total covers, e.g. "fuel, three nights, food and the cable car". */
  covers: string;
  rows: BudgetRow[];
  alternatives?: Stat[];
  insights: { title: string; text: string }[];
};

export type Trip = {
  slug: "kalinchowk" | "mustang";
  index: string;
  name: string;
  region: string;
  title: string;
  subtitle: string;
  tagline: string;
  hero: Photo;
  heroCaption: string;
  card: Photo;
  finale: Photo;
  peak: { name: string; m: number };
  heroStats: Stat[];
  stopNames: Record<string, string>;
  /** Stops reached on foot / by cable car (dashed on the map). */
  summit: { key: string; label: string; via: string };
  overnight: string[];
  days: [Day, Day, Day, Day];
  tips: { title: string; text: string }[];
  checklist: string[];
  weather: { place: string; lat: number; lon: number };
  budget?: Budget;
};

export type RouteData = {
  /** [lat, lng] pairs, as written by scripts/build-route.mjs */
  stops: Record<string, number[]>;
  days: { day: number; km: number; line: number[][] }[];
  walks: { day: number; from: string; to: string }[];
  profile: { day: number; km: number; m: number }[];
  marks: { key: string; day: number; km: number }[];
};
