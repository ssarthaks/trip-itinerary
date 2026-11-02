"use client";

export const SHOW_DAY_EVENT = "route:show-day";

export default function ShowOnMap({ day }: { day: number }) {
  return (
    <a
      href="#route"
      className="pill pill-outline"
      onClick={() => window.dispatchEvent(new CustomEvent(SHOW_DAY_EVENT, { detail: day }))}
    >
      Day {day} on the map <span aria-hidden="true">↗</span>
    </a>
  );
}
