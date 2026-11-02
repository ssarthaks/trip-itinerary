"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteData } from "@/data/types";
import { dayColors, type TripSlug } from "./nav";

export type BaseLayer = "light" | "street" | "terrain";

const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Free, keyless tile servers only. "Light" is the standard OSM style softened
// with a CSS filter (.tiles-light) so no paid basemap is needed.
const TILES: Record<BaseLayer, { url: string; options: L.TileLayerOptions }> = {
  light: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19, attribution: OSM, className: "tiles-light" },
  },
  street: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19, attribution: OSM },
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: {
      subdomains: "abc",
      maxZoom: 17,
      attribution: `${OSM}, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`,
    },
  },
};

const ll = (p: number[]): L.LatLngTuple => [p[0], p[1]];

const loadRoute = (slug: TripSlug): Promise<RouteData> =>
  (slug === "mustang" ? import("@/data/routes/mustang.json") : import("@/data/routes/kalinchowk.json")).then(
    (m) => m.default as RouteData,
  );

type Props = {
  slug: TripSlug;
  day: number;
  layer: BaseLayer;
  stopNames: Record<string, string>;
  overnight: string[];
  summit: { key: string; label: string; via: string };
};

type DayLayer = { n: number; casing: L.Polyline; line: L.Polyline; walk?: L.Polyline; bounds: L.LatLngBounds };

const dot = (kind: "stop" | "major" | "summit") =>
  L.divIcon({
    className: `map-marker map-marker-${kind}`,
    iconSize: kind === "stop" ? [10, 10] : [16, 16],
    iconAnchor: kind === "stop" ? [5, 5] : [8, 8],
  });

function fitPadding(map: L.Map): L.FitBoundsOptions {
  // The route panel floats over the left of the map on wide screens.
  const wide = map.getContainer().clientWidth > 860;
  return wide
    ? { paddingTopLeft: [460, 60], paddingBottomRight: [60, 60] }
    : { paddingTopLeft: [24, 56], paddingBottomRight: [72, 24] }; // labels hang off to the right
}

export default function RouteMap({ slug, day, layer, stopNames, overnight, summit }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const daysRef = useRef<DayLayer[]>([]);
  const [ready, setReady] = useState(false);
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [unlocked, setUnlocked] = useState(false);

  // Build the map once per trip.
  useEffect(() => {
    if (!el.current) return;
    let cancelled = false;
    const map = L.map(el.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: !touch,
      zoomSnap: 0.25,
      attributionControl: true,
    });
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.setView([27.9, 85.3], 8);

    loadRoute(slug).then((route) => {
      if (cancelled) return;
      const all = L.latLngBounds([]);
      daysRef.current = route.days.map((d) => {
        const color = dayColors[d.day - 1];
        const path = d.line.map(ll);
        const casing = L.polyline(path, { color: "#fff", weight: 8, opacity: 0.9, interactive: false }).addTo(map);
        const line = L.polyline(path, { color, weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" })
          .bindTooltip(`Day ${d.day} · ${d.km} km`, { sticky: true, className: "map-tip" })
          .addTo(map);
        const bounds = line.getBounds();
        const w = route.walks.find((x) => x.day === d.day);
        let walk: L.Polyline | undefined;
        if (w) {
          walk = L.polyline([ll(route.stops[w.from]), ll(route.stops[w.to])], {
            color,
            weight: 3,
            dashArray: "2 8",
            lineCap: "round",
          }).addTo(map);
          bounds.extend(walk.getBounds());
        }
        all.extend(bounds);
        return { n: d.day, casing, line, walk, bounds };
      });

      // The summit and the stop it's walked from sit close together, so their
      // labels point away from each other.
      const summitEast = route.stops[summit.key][1] > route.stops[summit.via][1];
      const side = (east: boolean): { direction: L.Direction; offset: L.PointTuple } =>
        east ? { direction: "right", offset: [10, 0] } : { direction: "left", offset: [-10, 0] };

      for (const [key, latlng] of Object.entries(route.stops)) {
        const isSummit = key === summit.key;
        const isMajor = isSummit || overnight.includes(key) || key === "kathmandu";
        const marker = L.marker(ll(latlng), {
          icon: dot(isSummit ? "summit" : isMajor ? "major" : "stop"),
          keyboard: false,
          title: stopNames[key] ?? key,
        }).addTo(map);
        // Narrow maps get short labels so they don't pile up.
        const narrow = map.getContainer().clientWidth < 640;
        const label = isSummit
          ? narrow
            ? summit.label.split(" · ").at(-1)!
            : summit.label
          : key === "kathmandu" && !narrow
            ? "Kathmandu · start & finish"
            : stopNames[key] ?? key;
        marker.bindTooltip(label, {
          permanent: isMajor,
          ...(isSummit ? side(summitEast) : key === summit.via ? side(!summitEast) : side(true)),
          className: isMajor ? "map-label" : "map-tip",
        });
      }

      map.fitBounds(all, fitPadding(map));
      setReady(true);
    });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      daysRef.current = [];
      setReady(false);
    };
  }, [slug, stopNames, overnight, summit, touch]);

  // Base layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileRef.current?.remove();
    const t = TILES[layer];
    tileRef.current = L.tileLayer(t.url, t.options).addTo(map);
    tileRef.current.bringToBack();
  }, [layer, ready]);

  // Highlight + fly to the selected day.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const all = L.latLngBounds([]);
    for (const d of daysRef.current) {
      const on = day === 0 || d.n === day;
      d.line.setStyle({ opacity: on ? 1 : 0.18, weight: day !== 0 && on ? 5 : 4 });
      d.casing.setStyle({ opacity: on ? 0.9 : 0 });
      d.walk?.setStyle({ opacity: on ? 1 : 0.18 });
      if (on) {
        all.extend(d.bounds);
        d.casing.bringToFront();
        d.line.bringToFront();
      }
    }
    if (all.isValid()) map.flyToBounds(all, { ...fitPadding(map), duration: 0.9 });
  }, [day, ready]);

  // On touch screens one finger scrolls the page until the map is unlocked.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !touch) return;
    if (unlocked) map.dragging.enable();
    else map.dragging.disable();
  }, [unlocked, touch, ready]);

  return (
    <div className="map-root">
      <div ref={el} className="map" role="region" aria-label="Route map" />
      {touch && (
        <button type="button" className="map-lock" data-unlocked={unlocked} onClick={() => setUnlocked((u) => !u)}>
          {unlocked ? "Done" : "Tap to explore"}
        </button>
      )}
    </div>
  );
}
