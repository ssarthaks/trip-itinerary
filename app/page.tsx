import Image from "next/image";
import Link from "next/link";
import { tripList, totalKm } from "@/data/trips";
import { websiteJsonLd } from "@/data/seo";
import JsonLd from "@/components/JsonLd";

export default function ChooseRide() {
  return (
    <main className="chooser">
      <JsonLd data={websiteJsonLd(tripList)} />
      <div className="chooser-head">
        <p className="eyebrow">Sarthak &amp; Rahul · MT-15 + XPulse 200 4V</p>
        <h1 className="chooser-title">
          Pick a <em>ride.</em>
          <span className="sr-only"> Kalinchowk or Mustang: two 4-day motorbike itineraries from Kathmandu</span>
        </h1>
        <p className="lede">
          Two plans, four days each. Choose one to open the itinerary — you can switch any time from the header.{" "}
          <Link href="/compare/" className="text-link">
            Not sure? Compare them →
          </Link>
        </p>
      </div>

      <div className="chooser-grid">
        {tripList.map((trip, i) => (
          <Link key={trip.slug} href={`/${trip.slug}/`} className="ride-card">
            <Image
              src={trip.card.src}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 860px) 100vw, 50vw"
              className="ride-card-img"
            />
            <span className="ride-card-shade" aria-hidden="true" />
            <span className="ride-card-body">
              <span className="ride-card-index">Itinerary {trip.index}</span>
              <span className="ride-card-name">{trip.name}</span>
              <span className="ride-card-sub">{trip.tagline}</span>
              <span className="ride-card-stats">
                <span>4 days</span>
                <span>{totalKm(trip.slug)} km</span>
                <span>{trip.peak.m.toLocaleString("en-US")} m</span>
              </span>
              <span className="ride-card-cta">
                Open itinerary <span aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
