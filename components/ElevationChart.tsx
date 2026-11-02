"use client";

import { useEffect, useRef, useState } from "react";
import type { RouteData } from "@/data/types";
import { dayColors } from "./nav";

type Props = {
  profile: RouteData["profile"];
  marks: RouteData["marks"];
  stopNames: Record<string, string>;
  summit: { label: string; m: number; via: string };
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function ElevationChart({ profile, marks, stopNames, summit }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const narrow = width < 640;
  const height = narrow ? 280 : 380;
  const m = { top: narrow ? 64 : 72, right: 12, bottom: 30, left: 44 };
  const total = profile[profile.length - 1].km;
  const yMax = Math.ceil(Math.max(summit.m, ...profile.map((p) => p.m)) / 1000) * 1000;
  const iw = Math.max(0, width - m.left - m.right);
  const ih = height - m.top - m.bottom;
  const x = (km: number) => m.left + (km / total) * iw;
  const y = (alt: number) => m.top + ih - (alt / yMax) * ih;

  const dayNums = [...new Set(profile.map((p) => p.day))];
  const segments = dayNums.map((d) => {
    const pts = profile.filter((p) => p.day === d);
    const prev = profile.filter((p) => p.day === d - 1).at(-1);
    const all = prev ? [prev, ...pts] : pts;
    const line = all.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)},${y(p.m).toFixed(1)}`).join("");
    const area = `${line}L${x(all.at(-1)!.km).toFixed(1)},${y(0)}L${x(all[0].km).toFixed(1)},${y(0)}Z`;
    return { d, line, area, start: all[0].km, end: all.at(-1)!.km };
  });

  // Where each night is spent: the last stop of every day but the final one.
  const nights = dayNums.slice(0, -1).map((d) => {
    const last = marks.filter((mk) => mk.day === d).at(-1)!;
    return { day: d, km: last.km, name: stopNames[last.key] ?? last.key };
  });

  const low = profile.reduce((a, b) => (b.m < a.m ? b : a));
  const summitKm = marks.find((mk) => mk.key === summit.via && mk.day === 2)?.km;
  const summitBase = summitKm === undefined ? null : profile.reduce((a, b) => (Math.abs(b.km - summitKm) < Math.abs(a.km - summitKm) ? b : a));

  const nearestStop = (km: number) =>
    marks.reduce((a, b) => (Math.abs(b.km - km) < Math.abs(a.km - km) ? b : a));

  const altAt = (km: number) => profile.reduce((a, b) => (Math.abs(b.km - km) < Math.abs(a.km - km) ? b : a)).m;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const km = ((e.clientX - rect.left) / rect.width) * total;
    let best = 0;
    for (let i = 1; i < profile.length; i++) {
      if (Math.abs(profile[i].km - km) < Math.abs(profile[best].km - km)) best = i;
    }
    setHover(best);
  };

  const h = hover === null ? null : profile[hover];
  const hStop = h ? nearestStop(h.km) : null;
  const kmStep = total > 600 ? 100 : 50;
  const kmTicks = Array.from({ length: Math.floor(total / kmStep) + 1 }, (_, i) => i * kmStep).filter(
    (k, i) => !narrow || i % 2 === 0,
  );

  return (
    <figure className="elev">
      <ul className="legend" aria-label="Days">
        {dayNums.map((d) => (
          <li key={d}>
            <span className="legend-swatch" style={{ background: dayColors[d - 1] }} aria-hidden="true" />
            Day {d}
          </li>
        ))}
        <li className="legend-walk">
          <span className="legend-dash" aria-hidden="true" />
          On foot
        </li>
      </ul>

      <div ref={box} className="elev-box" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={`Elevation profile, ${fmt(total)} km, highest point ${fmt(summit.m)} m`}>
            {[...Array(yMax / 1000 + 1)].map((_, i) => (
              <g key={i}>
                <line x1={m.left} x2={width - m.right} y1={y(i * 1000)} y2={y(i * 1000)} className="grid" />
                <text x={m.left - 8} y={y(i * 1000)} className="tick" textAnchor="end" dominantBaseline="middle">
                  {i === 0 ? "0" : `${i}k`}
                </text>
              </g>
            ))}

            {kmTicks.map((k) => (
              <text key={k} x={x(k)} y={height - 8} className="tick" textAnchor="middle">
                {k}
                {k === kmTicks.at(-1) ? " km" : ""}
              </text>
            ))}

            {segments.map((s) => (
              <g key={s.d}>
                <path d={s.area} fill={dayColors[s.d - 1]} fillOpacity={0.1} />
                <path d={s.line} fill="none" stroke={dayColors[s.d - 1]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </g>
            ))}

            {nights.map((n, i) => {
              const row = i % 2;
              const ly = m.top - (row ? 14 : 36);
              return (
                <g key={n.day}>
                  <line x1={x(n.km)} x2={x(n.km)} y1={ly + 6} y2={y(0)} className="night-line" />
                  <text x={x(n.km)} y={ly} className="night-label" textAnchor="middle">
                    {narrow ? n.name.split(" ")[0] : `Night ${n.day} · ${n.name}`}
                  </text>
                </g>
              );
            })}

            {summitBase && summitKm !== undefined && (
              <g>
                <line
                  x1={x(summitKm)}
                  x2={x(summitKm)}
                  y1={y(summitBase.m)}
                  y2={y(summit.m)}
                  stroke={dayColors[1]}
                  strokeWidth={2}
                  strokeDasharray="2 5"
                  strokeLinecap="round"
                />
                <circle cx={x(summitKm)} cy={y(summit.m)} r={5} fill={dayColors[1]} stroke="#fff" strokeWidth={2} />
                <text
                  x={x(summitKm) + (x(summitKm) > width * 0.6 ? -10 : 10)}
                  y={y(summit.m) + 4}
                  className="annot"
                  textAnchor={x(summitKm) > width * 0.6 ? "end" : "start"}
                >
                  {narrow ? `${fmt(summit.m)} m` : summit.label}
                </text>
              </g>
            )}

            <g>
              <circle cx={x(low.km)} cy={y(low.m)} r={4} fill="#fff" stroke={dayColors[low.day - 1]} strokeWidth={2} />
              <text x={x(low.km)} y={y(low.m) - 10} className="annot annot-muted" textAnchor="middle">
                {fmt(low.m)} m
              </text>
            </g>

            {h && (
              <g pointerEvents="none">
                <line x1={x(h.km)} x2={x(h.km)} y1={m.top} y2={y(0)} className="crosshair" />
                <circle cx={x(h.km)} cy={y(h.m)} r={5} fill={dayColors[h.day - 1]} stroke="#fff" strokeWidth={2} />
              </g>
            )}

            <rect
              x={m.left}
              y={m.top}
              width={iw}
              height={ih}
              fill="transparent"
              style={{ touchAction: "pan-y", cursor: "crosshair" }}
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}

        {h && hStop && (
          <div
            className="elev-tip"
            style={{
              left: Math.min(Math.max(x(h.km), 90), width - 90),
              top: Math.max(y(h.m) - 12, 8),
            }}
          >
            <span className="elev-tip-alt">{fmt(h.m)} m</span>
            <span>
              Day {h.day} · km {fmt(h.km)}
            </span>
            {Math.abs(hStop.km - h.km) < 12 && <span className="elev-tip-stop">near {stopNames[hStop.key]}</span>}
          </div>
        )}
      </div>

      <details className="elev-table">
        <summary>Show stops as a table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Stop</th>
              <th scope="col">km</th>
              <th scope="col">Elevation</th>
            </tr>
          </thead>
          <tbody>
            {marks
              .filter((mk, i) => i === 0 || mk.key !== marks[i - 1].key)
              .map((mk) => (
                <tr key={`${mk.day}-${mk.key}-${mk.km}`}>
                  <td>{mk.day}</td>
                  <td>{stopNames[mk.key] ?? mk.key}</td>
                  <td>{fmt(mk.km)}</td>
                  <td>≈ {fmt(altAt(mk.km))} m</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
