"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { dayColors, type TripSlug } from "./nav";
import { SHOW_DAY_EVENT } from "./ShowOnMap";
import type { BaseLayer } from "./RouteMap";

// Leaflet touches `window` on import, so the map only ever loads in the browser.
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map…</div>,
});

const LAYERS: { id: BaseLayer; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "street", label: "Street" },
  { id: "terrain", label: "Terrain" },
];

type Props = {
  slug: TripSlug;
  total: number;
  stopNames: Record<string, string>;
  overnight: string[];
  summit: { key: string; label: string; via: string };
  days: { n: number; title: string }[];
};

export default function RouteMapLoader({ slug, total, stopNames, overnight, summit, days }: Props) {
  const [day, setDay] = useState(0);
  const [layer, setLayer] = useState<BaseLayer>("street");

  useEffect(() => {
    const onShow = (e: Event) => setDay((e as CustomEvent<number>).detail);
    window.addEventListener(SHOW_DAY_EVENT, onShow);
    return () => window.removeEventListener(SHOW_DAY_EVENT, onShow);
  }, []);

  return (
    <div className="route-wrap">
      <div className="route-panel reveal">
        <p className="eyebrow">The route</p>
        <h2 className="h2 route-total">
          {total} <em>km</em>
        </h2>
        <p className="route-lede">Real roads, four days, two bikes. Tap a day to fly to it.</p>

        <div className="day-chips" role="group" aria-label="Show day">
          <button type="button" className="chip" aria-pressed={day === 0} onClick={() => setDay(0)}>
            All
          </button>
          {days.map((d) => (
            <button
              key={d.n}
              type="button"
              className="chip"
              aria-pressed={day === d.n}
              onClick={() => setDay(d.n)}
              style={{ "--chip": dayColors[d.n - 1] } as React.CSSProperties}
              title={d.title}
            >
              <span className="chip-dot" aria-hidden="true" />
              Day {d.n}
            </button>
          ))}
        </div>

        <p className="route-day-title" aria-live="polite">
          {day === 0 ? "Kathmandu and back" : days[day - 1].title}
        </p>

        <div className="layer-switch" role="group" aria-label="Map style">
          {LAYERS.map((l) => (
            <button key={l.id} type="button" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-shell">
        <RouteMap slug={slug} day={day} layer={layer} stopNames={stopNames} overnight={overnight} summit={summit} />
      </div>
    </div>
  );
}
