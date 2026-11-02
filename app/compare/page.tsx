import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { compareTrips, dayPairs, glance, pickIf, verdicts } from "@/data/compare";
import { compareJsonLd, compareSeo } from "@/data/seo";
import { routes, totalKm, tripList } from "@/data/trips";
import { allCredits } from "@/data/photos";
import type { Trip } from "@/data/types";
import { pageMetadata } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import ProfileCompare from "@/components/ProfileCompare";
import Weather from "@/components/Weather";
import { tripColors } from "@/components/nav";

export const metadata: Metadata = pageMetadata(compareSeo);

const slugs = ["kalinchowk", "mustang"] as const;
const npr = (n: number) => n.toLocaleString("en-US");

function TripTag({ slug }: { slug: Trip["slug"] }) {
  return (
    <span className="trip-tag">
      <span className="trip-dot" style={{ background: tripColors[slug] }} aria-hidden="true" />
      {compareTrips[slug].name}
    </span>
  );
}

export default function ComparePage() {
  const used = new Set(tripList.map((t) => t.card.src));
  const credits = allCredits.filter((c) => used.has(`/images/${c.folder}/${c.file}`));

  return (
    <main className="compare">
      <JsonLd data={compareJsonLd(tripList)} />

      <section id="top" className="section compare-hero">
        <div className="section-head reveal">
          <p className="eyebrow">Compare · same four days, two rides</p>
          <h1 className="chooser-title">
            Kalinchowk <em>vs</em> Mustang.
            <span className="sr-only"> Which 4-day motorbike ride from Kathmandu to pick</span>
          </h1>
          <p className="lede">One is relaxed and cheap, the other is big and snowy. Here&apos;s how they stack up.</p>
        </div>
        <div className="chooser-grid compare-cards">
          {tripList.map((trip, i) => (
            <Link key={trip.slug} href={`/${trip.slug}/`} className="ride-card">
              <Image src={trip.card.src} alt="" fill priority={i === 0} sizes="(max-width: 860px) 100vw, 50vw" className="ride-card-img" />
              <span className="ride-card-shade" aria-hidden="true" />
              <span className="ride-card-body">
                <span className="ride-card-index">Itinerary {trip.index}</span>
                <span className="ride-card-name">{trip.name}</span>
                <span className="ride-card-stats">
                  <span>{totalKm(trip.slug)} km</span>
                  <span>{npr(trip.peak.m)} m</span>
                  <span>{trip.days[0].weekday ? "Thu–Sun" : "4 days"}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="glance" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">At a glance</p>
          <h2 className="h2">
            Side by <em>side.</em>
          </h2>
        </header>
        <div className="glance reveal" role="table" aria-label="Kalinchowk and Mustang compared">
          <div className="glance-row glance-head" role="row">
            <span role="columnheader" className="glance-label" />
            {slugs.map((s) => (
              <span key={s} role="columnheader">
                <TripTag slug={s} />
              </span>
            ))}
          </div>
          {glance.map((row) => (
            <div key={row.label} className="glance-row" role="row">
              <span role="rowheader" className="glance-label">
                {row.label}
              </span>
              {slugs.map((s) => (
                <span key={s} role="cell" className="glance-cell" data-better={row.better === s || undefined}>
                  <span className="glance-value">
                    {row[s].value}
                    {row.better === s && (
                      <span className="better-mark" style={{ color: tripColors[s] }} title="Better here">
                        <span className="sr-only">, better here</span>
                        <span aria-hidden="true">●</span>
                      </span>
                    )}
                  </span>
                  {row[s].note && <span className="glance-note">{row[s].note}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="compare-key reveal">
          <span aria-hidden="true">●</span> marks the better side for that row.
        </p>
      </section>

      <section id="climb" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">Elevation · same scale</p>
          <h2 className="h2">
            Shorter, <em>or</em> longer &amp; wilder.
          </h2>
        </header>
        <div className="reveal">
          <ProfileCompare
            series={slugs.map((s) => ({
              name: compareTrips[s].name,
              color: tripColors[s],
              km: totalKm(s),
              peak: `${npr(compareTrips[s].peak.m)} m top`,
              profile: routes[s].profile,
            }))}
          />
        </div>
      </section>

      <section id="better" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">What&apos;s better, where</p>
          <h2 className="h2">
            Each wins <em>something.</em>
          </h2>
        </header>
        <div className="better-grid">
          {slugs.map((s) => (
            <div key={s} className="better-col reveal" style={{ "--trip": tripColors[s] } as React.CSSProperties}>
              <p className="better-head">
                <TripTag slug={s} /> wins on
              </p>
              <ul>
                {verdicts
                  .filter((v) => v.winner === s)
                  .map((v) => (
                    <li key={v.title}>
                      <p className="better-title">{v.title}</p>
                      <p className="better-text">{v.text}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="days" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">Day by day</p>
          <h2 className="h2">
            Four days, <em>two ways.</em>
          </h2>
        </header>
        <ol className="day-pairs reveal">
          <li className="day-pair day-pair-head" aria-hidden="true">
            <span />
            <TripTag slug="kalinchowk" />
            <TripTag slug="mustang" />
          </li>
          {dayPairs.map((d) => (
            <li key={d.n} className="day-pair">
              <span className="day-pair-n">Day {String(d.n).padStart(2, "0")}</span>
              {slugs.map((s) => (
                <span key={s} className="day-pair-cell">
                  <span className="sr-only">{compareTrips[s].name}: </span>
                  <span className="day-pair-title">{d[s].title}</span>
                  <span className="day-pair-meta">
                    {d[s].km} km · {d[s].time}
                  </span>
                </span>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <section id="snow" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">Snow check · live</p>
          <h2 className="h2">
            Where&apos;s the <em>snow?</em>
          </h2>
          <p className="lede">Today&apos;s weather and the next four days at both high points. Snowfall shows up in blue.</p>
        </header>
        <div className="snow-grid reveal">
          {slugs.map((s) => (
            <Weather
              key={s}
              place={compareTrips[s].weather.place}
              lat={compareTrips[s].weather.lat}
              lon={compareTrips[s].weather.lon}
            />
          ))}
        </div>
      </section>

      <section id="verdict" className="section">
        <header className="section-head reveal">
          <p className="eyebrow">The verdict</p>
          <h2 className="h2">
            So, which <em>one?</em>
          </h2>
        </header>
        <div className="verdict-grid">
          {slugs.map((s) => (
            <div key={s} className="verdict-card reveal" style={{ "--trip": tripColors[s] } as React.CSSProperties}>
              <p className="verdict-title">
                Pick <span>{compareTrips[s].name}</span> if
              </p>
              <ul>
                {pickIf[s].map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <Link href={`/${s}/`} className="pill pill-dark">
                Open the {compareTrips[s].name} plan <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
        <footer className="credits compare-credits">
          <details>
            <summary>Photo credits &amp; data</summary>
            <p>Routing by OSRM, elevation and live weather by Open-Meteo.</p>
            <ul>
              {credits.map((c) => (
                <li key={`${c.folder}/${c.file}`}>
                  <a href={c.source}>{c.subject}</a> — {c.author}, {c.license}
                </li>
              ))}
            </ul>
          </details>
        </footer>
      </section>
    </main>
  );
}
