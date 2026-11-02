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
      { id: "prep", label: "Prep" },
    ],
  },
};

export const dayColors = ["#1f5fd1", "#d4402f", "#c98a12", "#0f9a82"] as const;
