import type { RouteData } from "@/data/types";

type Series = { name: string; color: string; km: number; peak: string; profile: RouteData["profile"] };

const W = 1000;
const H = 220;

/** Elevation profiles of both rides on one shared km and altitude scale. */
export default function ProfileCompare({ series }: { series: Series[] }) {
  const maxKm = Math.max(...series.map((s) => s.km));
  const yMax = 4000;
  const x = (km: number) => (km / maxKm) * W;
  const y = (m: number) => H - (m / yMax) * H;
  const ticks = Array.from({ length: Math.floor(maxKm / 100) + 1 }, (_, i) => i * 100);

  return (
    <figure className="pcompare">
      {series.map((s) => {
        const line = s.profile.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)},${y(p.m).toFixed(1)}`).join("");
        const end = s.profile[s.profile.length - 1];
        const area = `${line}L${x(end.km).toFixed(1)},${H}L0,${H}Z`;
        return (
          <div key={s.name} className="pcompare-row">
            <figcaption className="pcompare-label">
              <span className="pcompare-dot" style={{ background: s.color }} aria-hidden="true" />
              <strong>{s.name}</strong>
              <span>
                {s.km} km · {s.peak}
              </span>
            </figcaption>
            <div className="pcompare-plot">
              <span className="pcompare-y" style={{ top: 0 }}>4k m</span>
              <span className="pcompare-y" style={{ top: "50%" }}>2k</span>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${s.name} elevation profile over ${s.km} km, high point ${s.peak}`}>
                {[1000, 2000, 3000].map((m) => (
                  <line key={m} x1={0} x2={W} y1={y(m)} y2={y(m)} className="pcompare-grid" vectorEffect="non-scaling-stroke" />
                ))}
                <path d={area} fill={s.color} fillOpacity={0.12} />
                <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        );
      })}
      <div className="pcompare-axis" aria-hidden="true">
        {ticks.map((k) => (
          <span key={k} style={{ left: `${(k / maxKm) * 100}%` }}>
            {k}
          </span>
        ))}
        <span className="pcompare-unit">km</span>
      </div>
    </figure>
  );
}
