import type { Trip } from "./types";
import { kalinchowk, mustang, routes, totalKm } from "./trips";

type Slug = Trip["slug"];

const npr = (n: number) => n.toLocaleString("en-US");

/** Sum of the "riding" day stats, e.g. "6–7 h" + "4–5 h" → [10, 12]. */
function ridingHours(trip: Trip): [number, number] {
  return trip.days.reduce<[number, number]>(
    (sum, d) => {
      const stat = d.stats.find((s) => s.label === "riding");
      const m = stat?.value.match(/(\d+)–(\d+)/);
      return m ? [sum[0] + Number(m[1]), sum[1] + Number(m[2])] : sum;
    },
    [0, 0],
  );
}

/** Budget per person: pair budgets are halved, per-rider budgets used as is. */
function perPerson(trip: Trip): [number, number] {
  const b = trip.budget!;
  const low = b.rows.reduce((s, r) => s + r.low, 0);
  const high = b.rows.reduce((s, r) => s + r.high, 0);
  return b.basis === "pair" ? [low / 2, high / 2] : [low, high];
}

const longest = (slug: Slug) => routes[slug].days.reduce((a, b) => (b.km > a.km ? b : a));
const lowest = (slug: Slug) => routes[slug].profile.reduce((a, b) => (b.m < a.m ? b : a)).m;

const hours = { kalinchowk: ridingHours(kalinchowk), mustang: ridingHours(mustang) };
const cost = { kalinchowk: perPerson(kalinchowk), mustang: perPerson(mustang) };
const km = { kalinchowk: totalKm("kalinchowk"), mustang: totalKm("mustang") };
const longDay = { kalinchowk: longest("kalinchowk"), mustang: longest("mustang") };
const dayHours = (trip: Trip, n: number) => trip.days[n - 1].stats.find((s) => s.label === "riding")?.value;

export const compareTrips = { kalinchowk, mustang };

export type GlanceRow = {
  label: string;
  kalinchowk: { value: string; note?: string };
  mustang: { value: string; note?: string };
  better?: Slug;
};

export const glance: GlanceRow[] = [
  {
    label: "Distance",
    kalinchowk: { value: `${km.kalinchowk} km` },
    mustang: { value: `${km.mustang} km` },
    better: "kalinchowk",
  },
  {
    label: "Riding time",
    kalinchowk: { value: `${hours.kalinchowk[0]}–${hours.kalinchowk[1]} h`, note: `plus Day 2's ${routes.kalinchowk.days[1].km} km loop` },
    mustang: { value: `${hours.mustang[0]}–${hours.mustang[1]} h` },
    better: "kalinchowk",
  },
  {
    label: "Longest day",
    kalinchowk: { value: `${longDay.kalinchowk.km} km`, note: `Day ${longDay.kalinchowk.day} · ${dayHours(kalinchowk, longDay.kalinchowk.day)}` },
    mustang: { value: `${longDay.mustang.km} km`, note: `Day ${longDay.mustang.day} · ${dayHours(mustang, longDay.mustang.day)}` },
    better: "kalinchowk",
  },
  {
    label: "Highest by bike",
    kalinchowk: { value: "3,450 m", note: "Kuri Village" },
    mustang: { value: "≈ 3,700 m", note: "Muktinath parking" },
    better: "mustang",
  },
  {
    label: "Highest point",
    kalinchowk: { value: "3,842 m", note: "Kalinchowk Bhagwati" },
    mustang: { value: "3,710 m", note: "Muktinath Temple" },
    better: "kalinchowk",
  },
  {
    label: "Walking",
    kalinchowk: { value: "45–60 min", note: "hike up, or the cable car" },
    mustang: { value: "15–20 min", note: "walk up to the temple" },
    better: "mustang",
  },
  {
    label: "Budget, per person",
    kalinchowk: { value: `NPR ${npr(cost.kalinchowk[0])}–${npr(cost.kalinchowk[1])}` },
    mustang: { value: `NPR ${npr(cost.mustang[0])}–${npr(cost.mustang[1])}` },
    better: "kalinchowk",
  },
  {
    label: "Nights",
    kalinchowk: { value: "Kuri, Kuri, Jiri" },
    mustang: { value: "Tatopani, Muktinath, Pokhara" },
  },
  {
    label: "Roads",
    kalinchowk: { value: "Mostly blacktop", note: "rough, dusty patches near Kuri & Jiri" },
    mustang: { value: "Tarmac + a full off-road day", note: "loose gravel past Beni, black ice risk" },
  },
  {
    label: "Permit",
    kalinchowk: { value: "Check Gaurishankar CA" },
    mustang: { value: "ACAP · ~NPR 100", note: "Nepali citizens" },
  },
];

export type Verdict = { title: string; winner: Slug; text: string };

export const verdicts: Verdict[] = [
  {
    title: "Cheaper",
    winner: "kalinchowk",
    text: `NPR ${npr(cost.kalinchowk[0])}–${npr(cost.kalinchowk[1])} each, against ${npr(cost.mustang[0])}–${npr(cost.mustang[1])} for Mustang.`,
  },
  {
    title: "Less time in the saddle",
    winner: "kalinchowk",
    text: `${hours.kalinchowk[0]}–${hours.kalinchowk[1]} h of riding instead of ${hours.mustang[0]}–${hours.mustang[1]} h. The longest day is ${dayHours(kalinchowk, longDay.kalinchowk.day)}, not ${dayHours(mustang, longDay.mustang.day)}.`,
  },
  {
    title: "Kinder to the MT-15",
    winner: "kalinchowk",
    text: "Mostly blacktop with rough patches near Kuri. Mustang has a full off-road day up the gorge.",
  },
  {
    title: "Relaxed pace",
    winner: "kalinchowk",
    text: `Two nights in Kuri and a short ${routes.kalinchowk.days[1].km} km Day 2, with time to explore.`,
  },
  {
    title: "Highest summit",
    winner: "kalinchowk",
    text: "Kalinchowk Bhagwati at 3,842 m, a sunrise hike above Kuri.",
  },
  {
    title: "November snow",
    winner: "mustang",
    text: "Our research picked Muktinath as the surest bet for fresh snow in mid-November. Check the live forecast below.",
  },
  {
    title: "Ride higher",
    winner: "mustang",
    text: "You ride almost to Muktinath (3,710 m). On the Kalinchowk trip the road tops out at Kuri (3,450 m).",
  },
  {
    title: "Less walking",
    winner: "mustang",
    text: "15–20 minutes up to the temple, instead of a 45–60 minute climb or the cable car.",
  },
  {
    title: "Adventure & variety",
    winner: "mustang",
    text: `Kali Gandaki gorge, high desert and hot springs, from ≈ ${npr(Math.round(lowest("mustang") / 10) * 10)} m up to 3,710 m.`,
  },
];

export const pickIf: Record<Slug, string[]> = {
  kalinchowk: [
    "you want a relaxed, cheaper ride",
    "the MT-15 should stay comfortable",
    "a sunrise hike to 3,842 m sounds right",
  ],
  mustang: [
    "snow in November is the goal",
    "you want the big one: gorge, desert, hot springs",
    "9–10 h days and an off-road climb don't scare you",
  ],
};

// Days without a riding time (Kalinchowk Day 2 is a hike) show their first stat instead.
const dayTime = (trip: Trip, n: number) => {
  const first = trip.days[n - 1].stats[0];
  return dayHours(trip, n) ?? `${first.value} ${first.label}`;
};

export const dayPairs = kalinchowk.days.map((k, i) => {
  const m = mustang.days[i];
  return {
    n: k.n,
    kalinchowk: { title: k.title, km: routes.kalinchowk.days[i].km, time: dayTime(kalinchowk, k.n) },
    mustang: { title: m.title, km: routes.mustang.days[i].km, time: dayTime(mustang, m.n), weekday: m.weekday },
  };
});
