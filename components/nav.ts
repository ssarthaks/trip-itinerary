// Kept free of trip data so the client header stays tiny.
export type TripSlug = "kalinchowk" | "mustang";

export const tripNav: Record<TripSlug, { name: string; short: string; sections: { id: string; label: string }[] }> = {
  kalinchowk: {
    name: "Kalinchowk",
    short: "Kuri",
    sections: [
      { id: "riders", label: "Riders" },
      { id: "route", label: "Route" },
      { id: "climb", label: "Climb" },
      { id: "day-1", label: "Days" },
      { id: "budget", label: "Budget" },
      { id: "prep", label: "Prep" },
    ],
  },
  mustang: {
    name: "Mustang",
    short: "Mustang",
    sections: [
      { id: "riders", label: "Riders" },
      { id: "route", label: "Route" },
      { id: "climb", label: "Climb" },
      { id: "day-1", label: "Days" },
      { id: "budget", label: "Budget" },
      { id: "prep", label: "Prep" },
    ],
  },
};

export type PageKey = TripSlug | "compare";

type PageNav = { name: string; switcherShort?: string; menuTitle: string; sections: { id: string; label: string }[] };

/** Everything the header links to: both itineraries plus the comparison page. */
export const pageNav: Record<PageKey, PageNav> = {
  kalinchowk: { ...tripNav.kalinchowk, menuTitle: "Kalinchowk itinerary" },
  mustang: { ...tripNav.mustang, menuTitle: "Mustang itinerary" },
  compare: {
    name: "Compare",
    switcherShort: "vs",
    menuTitle: "Kalinchowk vs Mustang",
    sections: [
      { id: "glance", label: "Glance" },
      { id: "climb", label: "Climb" },
      { id: "better", label: "Better at" },
      { id: "days", label: "Days" },
      { id: "snow", label: "Snow" },
      { id: "verdict", label: "Verdict" },
    ],
  },
};

export const dayColors = ["#1f5fd1", "#d4402f", "#c98a12", "#0f9a82"] as const;

/** One colour per itinerary on the comparison page (cobalt sky, red roofs). */
export const tripColors: Record<TripSlug, string> = { kalinchowk: "#1f5fd1", mustang: "#d4402f" };
