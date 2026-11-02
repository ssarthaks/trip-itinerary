import Image from "next/image";
import Link from "next/link";
import type { Day, Photo, RouteData, Trip } from "@/data/types";
import { riders, totalKm, tripList } from "@/data/trips";
import { allCredits } from "@/data/photos";
import { dayColors } from "./nav";
import RouteMapLoader from "./RouteMapLoader";
import ElevationChart from "./ElevationChart";
import ShowOnMap from "./ShowOnMap";
import Checklist from "./Checklist";
import Weather from "./Weather";

const npr = (n: number) => n.toLocaleString("en-US");

function Frame({ photo, sizes, priority, className }: { photo: Photo; sizes: string; priority?: boolean; className?: string }) {
  return (
    <figure className={`frame ${className ?? ""}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} />
    </figure>
  );
}

function Hero({ trip }: { trip: Trip }) {
  return (
    <section id="top" className="section hero">
      <div className="hero-copy reveal">
        <p className="eyebrow">
          Itinerary {trip.index} · {trip.region}
        </p>
        <h1 className="display" data-long={trip.title.length > 6 || undefined}>
          {trip.title}
          <span className="sr-only">, {trip.subtitle}: a 4-day motorbike itinerary from Kathmandu</span>
        </h1>
        <p className="hero-sub">{trip.subtitle}</p>
        <dl className="hero-stats">
          {trip.heroStats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <a href="#riders" className="pill pill-dark">
          Start the ride <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="hero-media reveal">
        <Frame photo={trip.hero} sizes="(max-width: 860px) 100vw, 46vw" priority className="hero-frame" />
        <span className="hero-chip">
          <span className="dot" aria-hidden="true" />
          {trip.heroCaption}
        </span>
      </div>
    </section>
  );
}

function Riders() {
  return (
    <section id="riders" className="section riders">
      <header className="section-head reveal">
        <p className="eyebrow">The crew</p>
        <h2 className="h2">
          Two riders. <em>Two machines.</em>
        </h2>
      </header>
      <div className="rider-grid">
        {riders.map((r) => (
          <article key={r.name} className="rider reveal">
            <Frame photo={r.photo} sizes="(max-width: 860px) 100vw, 45vw" className="rider-frame" />
            <div className="rider-body">
              <h3 className="rider-name">{r.name}</h3>
              <p className="rider-bike">{r.bike}</p>
              <dl className="rider-specs">
                {r.specs.map((s) => (
                  <div key={s.label}>
                    <dd>{s.value}</dd>
                    <dt>{s.label}</dt>
                  </div>
                ))}
              </dl>
              <p className="rider-note">{r.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RouteSection({ trip }: { trip: Trip }) {
  return (
    <section id="route" className="section route">
      <RouteMapLoader
        slug={trip.slug}
        total={totalKm(trip.slug)}
        stopNames={trip.stopNames}
        overnight={trip.overnight}
        summit={trip.summit}
        days={trip.days.map((d) => ({ n: d.n, title: d.title }))}
      />
    </section>
  );
}

function Climb({ trip, route }: { trip: Trip; route: RouteData }) {
  const low = route.profile.reduce((a, b) => (b.m < a.m ? b : a));
  return (
    <section id="climb" className="section climb">
      <header className="section-head reveal">
        <p className="eyebrow">Elevation · {totalKm(trip.slug)} km</p>
        <h2 className="h2">
          {npr(Math.round(low.m / 10) * 10)} m <em>to</em> {npr(trip.peak.m)} m.
        </h2>
        <p className="lede">Every metre of road, day by day. Hover or drag across the line.</p>
      </header>
      <div className="reveal">
        <ElevationChart
          profile={route.profile}
          marks={route.marks}
          stopNames={trip.stopNames}
          summit={{ label: trip.summit.label, m: trip.peak.m, via: trip.summit.via }}
        />
      </div>
    </section>
  );
}

function DaySection({ day }: { day: Day }) {
  const color = dayColors[day.n - 1];
  return (
    <section
      id={`day-${day.n}`}
      className="section day"
      data-flip={day.n % 2 === 0 || undefined}
      style={{ "--day": color } as React.CSSProperties}
    >
      <div className="day-media reveal">
        <Frame photo={day.photos[0]} sizes="(max-width: 860px) 100vw, 40vw" className="day-main" />
        <Frame photo={day.photos[1]} sizes="(max-width: 860px) 50vw, 20vw" className="day-small" />
        <Frame photo={day.photos[2]} sizes="(max-width: 860px) 50vw, 20vw" className="day-small" />
      </div>

      <div className="day-copy reveal">
        <p className="eyebrow day-eyebrow">
          <span className="day-dot" aria-hidden="true" />
          Day {String(day.n).padStart(2, "0")}
          {day.weekday && <span className="day-weekday"> · {day.weekday}</span>}
        </p>
        <h2 className="h2 day-title">{day.title}</h2>
        <p className="day-kicker">{day.kicker}</p>
        <p className="day-summary">{day.summary}</p>

        <dl className="day-stats">
          {day.stats.map((s) => (
            <div key={s.label}>
              <dd>{s.value}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>

        <ol className="chain" aria-label="Stops">
          {day.chain.map((stop, i) => (
            <li key={`${stop}-${i}`}>{stop}</li>
          ))}
        </ol>

        <ul className="highlights">
          {day.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className="day-foot">
          <p className="night">
            <span className="night-icon" aria-hidden="true">☾</span>
            {day.night}
          </p>
          <ShowOnMap day={day.n} />
        </div>

        {day.note && (
          <p className="note">
            <strong>{day.note.label}</strong> {day.note.text}
          </p>
        )}
      </div>
    </section>
  );
}

function Budget({ budget }: { budget: NonNullable<Trip["budget"]> }) {
  const low = budget.rows.reduce((s, r) => s + r.low, 0);
  const high = budget.rows.reduce((s, r) => s + r.high, 0);
  const max = Math.max(...budget.rows.map((r) => r.high));
  return (
    <section id="budget" className="section budget">
      <header className="section-head reveal">
        <p className="eyebrow">Budget · {budget.basis === "pair" ? "for two, own bikes" : "per rider, own bike"}</p>
        <h2 className="h2 budget-total">
          <span className="currency">NPR</span> {npr(low)}<em>–</em>{npr(high)}
        </h2>
        <p className="lede">
          {budget.basis === "pair" ? (
            <>
              About <strong>NPR {npr(low / 2)}–{npr(high / 2)}</strong> each.
            </>
          ) : (
            <>
              About <strong>NPR {npr(low * 2)}–{npr(high * 2)}</strong> for both of us.
            </>
          )}{" "}
          Covers {budget.covers}.
        </p>
      </header>

      <div className="budget-grid">
        <ul className="budget-rows reveal">
          {budget.rows.map((r) => (
            <li key={r.category}>
              <div className="budget-row-head">
                <span className="budget-cat">{r.category}</span>
                <span className="budget-amt">
                  {r.low === r.high ? npr(r.low) : `${npr(r.low)}–${npr(r.high)}`}
                </span>
              </div>
              <div className="range" aria-hidden="true">
                <span
                  className="range-bar"
                  style={{ left: `${(r.low / max) * 100}%`, width: `max(8px, ${((r.high - r.low) / max) * 100}%)` }}
                />
                <span className="range-base" style={{ width: `${(r.low / max) * 100}%` }} />
              </div>
              <p className="budget-note">{r.note}</p>
            </li>
          ))}
        </ul>

        <aside className="budget-side reveal">
          {budget.alternatives && (
            <div className="card">
              <p className="eyebrow">Or let an agency do it</p>
              <dl className="alt-list">
                {budget.alternatives.map((a) => (
                  <div key={a.label}>
                    <dd>{a.value}</dd>
                    <dt>{a.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {budget.insights.map((i) => (
            <div key={i.title} className="card card-quiet">
              <p className="card-title">{i.title}</p>
              <p>{i.text}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function Prep({ trip }: { trip: Trip }) {
  return (
    <section id="prep" className="section prep">
      <header className="section-head reveal">
        <p className="eyebrow">Before we ride</p>
        <h2 className="h2">
          Pack light. <em>Pack warm.</em>
        </h2>
      </header>
      <div className="prep-grid">
        <div className="reveal">
          <Checklist storageKey={`checklist:${trip.slug}`} items={trip.checklist} />
        </div>
        <ul className="tips reveal">
          {trip.tips.map((t) => (
            <li key={t.title}>
              <p className="card-title">{t.title}</p>
              <p>{t.text}</p>
            </li>
          ))}
        </ul>
        <div className="reveal">
          <Weather place={trip.weather.place} lat={trip.weather.lat} lon={trip.weather.lon} />
        </div>
      </div>
    </section>
  );
}

function Finale({ trip }: { trip: Trip }) {
  const other = tripList.find((t) => t.slug !== trip.slug)!;
  const used = new Set(
    [trip.hero, trip.finale, ...trip.days.flatMap((d) => d.photos), ...riders.map((r) => r.photo)].map((p) => p.src),
  );
  const credits = allCredits.filter((c) => used.has(`/images/${c.folder}/${c.file}`));
  return (
    <section id="end" className="section finale">
      <Image src={trip.finale.src} alt={trip.finale.alt} fill sizes="100vw" className="finale-img" />
      <div className="finale-shade" aria-hidden="true" />
      <div className="finale-copy reveal">
        <p className="eyebrow">Sarthak &amp; Rahul</p>
        <h2 className="display finale-title">
          See you at <em>{npr(trip.peak.m)} m.</em>
        </h2>
        <div className="finale-actions">
          <a href="#top" className="pill pill-light">
            Back to top <span aria-hidden="true">↑</span>
          </a>
          <Link href={`/${other.slug}/`} className="pill pill-ghost">
            See the {other.name} plan <span aria-hidden="true">→</span>
          </Link>
          <Link href="/compare/" className="pill pill-ghost">
            Compare both
          </Link>
        </div>
      </div>
      <footer className="credits">
        <details>
          <summary>Photo credits &amp; map data</summary>
          <p>
            Maps © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors and
            OpenTopoMap (CC-BY-SA). Routing by OSRM, elevation and live weather by Open-Meteo.
          </p>
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
  );
}

export default function TripPage({ trip, route }: { trip: Trip; route: RouteData }) {
  return (
    <main className="trip" data-trip={trip.slug}>
      <Hero trip={trip} />
      <Riders />
      <RouteSection trip={trip} />
      <Climb trip={trip} route={route} />
      {trip.days.map((d) => (
        <DaySection key={d.n} day={d} />
      ))}
      {trip.budget && <Budget budget={trip.budget} />}
      <Prep trip={trip} />
      <Finale trip={trip} />
    </main>
  );
}
