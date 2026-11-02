// Builds data/routes/<trip>.json: real road geometry (OSRM) per day, stop
// positions and an elevation profile (Open-Meteo) for each itinerary.
// Run with `npm run route:build`.
import { writeFile, mkdir } from "node:fs/promises";

const TRIPS = {
  kalinchowk: {
    stops: {
      kathmandu: [27.7083, 85.3206],
      banepa: [27.6299, 85.524],
      dhulikhel: [27.6189, 85.5529],
      mude: [27.6841, 85.926],
      lamosangu: [27.756, 85.8457],
      charikot: [27.6636, 86.0488],
      kuri: [27.7594, 86.0475],
      kalinchowk: [27.76, 86.032],
      dolakha: [27.6779, 86.0763],
      jiri: [27.6374, 86.2311],
    },
    rides: [
      { day: 1, via: ["kathmandu", "banepa", "dhulikhel", "mude", "charikot", "kuri"] },
      { day: 2, via: ["kuri", "dolakha", "kuri"] },
      { day: 3, via: ["kuri", "charikot", "jiri"] },
      { day: 4, via: ["jiri", "charikot", "mude", "lamosangu", "dhulikhel", "kathmandu"] },
    ],
    // On foot (or cable car) — drawn dashed, not part of the road distance.
    walks: [{ day: 2, from: "kuri", to: "kalinchowk" }],
  },
  mustang: {
    stops: {
      kathmandu: [27.7083, 85.3206],
      mugling: [27.8562, 84.561],
      pokhara: [28.2095, 83.9914],
      beni: [28.3445, 83.5666],
      tatopani: [28.4967, 83.6543],
      marpha: [28.7519, 83.6862],
      jomsom: [28.7838, 83.7305],
      kagbeni: [28.8378, 83.7843],
      ranipauwa: [28.8156, 83.8636],
      muktinath: [28.8167, 83.8713],
    },
    rides: [
      { day: 1, via: ["kathmandu", "mugling", "pokhara", "beni", "tatopani"] },
      { day: 2, via: ["tatopani", "marpha", "jomsom", "kagbeni", "ranipauwa"] },
      { day: 3, via: ["ranipauwa", "jomsom", "beni", "pokhara"] },
      { day: 4, via: ["pokhara", "mugling", "kathmandu"] },
    ],
    walks: [{ day: 2, from: "ranipauwa", to: "muktinath" }],
  },
};

const round = (n) => Math.round(n * 1e5) / 1e5;

// Ramer–Douglas–Peucker on [lat, lng] pairs.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]];
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicular(points[i], a, b);
    if (d > maxDist) [maxDist, index] = [d, i];
  }
  if (maxDist <= tolerance) return [a, b];
  const left = simplify(points.slice(0, index + 1), tolerance);
  return [...left.slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

function perpendicular([y, x], [y1, x1], [y2, x2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function haversineKm([lat1, lng1], [lat2, lng2]) {
  const r = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempt = 0) {
  const res = await fetch(url, { headers: { "User-Agent": "kalinchowk-trip-site/1.0" } });
  if (res.status === 429 && attempt < 6) {
    await sleep(5000 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// The public OSRM car graph has a gap above Jomsom, so those legs use the
// FOSSGIS bike graph, which follows the same jeep road up to Muktinath.
const CAR = "https://router.project-osrm.org/route/v1/driving";
const BIKE = "https://routing.openstreetmap.de/routed-bike/route/v1/driving";
const BIKE_LEGS = new Set(["jomsom>kagbeni", "kagbeni>ranipauwa", "ranipauwa>jomsom"]);

async function route(stops, via) {
  const line = [];
  let km = 0;
  for (let i = 1; i < via.length; i++) {
    const [a, b] = [via[i - 1], via[i]];
    const base = BIKE_LEGS.has(`${a}>${b}`) ? BIKE : CAR;
    const coords = [a, b].map((k) => `${stops[k][1]},${stops[k][0]}`).join(";");
    const data = await getJson(`${base}/${coords}?overview=full&geometries=geojson`);
    if (data.code !== "Ok") throw new Error(`OSRM ${a}>${b}: ${data.code}`);
    const r = data.routes[0];
    const leg = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    line.push(...(line.length ? leg.slice(1) : leg));
    km += r.distance / 1000;
    await sleep(300);
  }
  return { line, km };
}

// Evenly spaced samples (by distance) along a polyline.
function sample(line, count) {
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversineKm(line[i - 1], line[i]));
  const total = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let s = 0; s < count; s++) {
    const target = (total * s) / (count - 1);
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const t = (target - cum[j]) / span;
    out.push({
      km: target,
      point: [
        line[j][0] + (line[j + 1][0] - line[j][0]) * t,
        line[j][1] + (line[j + 1][1] - line[j][1]) * t,
      ],
    });
  }
  return out;
}

async function elevations(points) {
  const out = [];
  for (let i = 0; i < points.length; i += 90) {
    const chunk = points.slice(i, i + 90);
    const lat = chunk.map((p) => p[0].toFixed(4)).join(",");
    const lng = chunk.map((p) => p[1].toFixed(4)).join(",");
    const data = await getJson(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
    );
    out.push(...data.elevation);
    await sleep(1000);
  }
  return out;
}

async function buildTrip(slug, { stops, rides, walks }) {
  const days = [];
  const profile = [];
  const marks = [];
  let offset = 0;

  for (const ride of rides) {
    const { line, km } = await route(stops, ride.via);
    const cum = [0];
    for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversineKm(line[i - 1], line[i]));
    let from = 0;
    for (const key of ride.via) {
      let best = from;
      for (let i = from; i < line.length; i++) {
        if (haversineKm(line[i], stops[key]) < haversineKm(line[best], stops[key])) best = i;
      }
      // Stops are visited in order, so later stops must come after earlier ones.
      from = best;
      marks.push({ key, day: ride.day, km: Math.round((offset + cum[best]) * 10) / 10 });
    }
    const samples = sample(line, Math.max(20, Math.round(km / 2.5)));
    const elev = await elevations(samples.map((s) => s.point));
    samples.forEach((s, i) =>
      profile.push({ day: ride.day, km: Math.round((offset + s.km) * 10) / 10, m: Math.round(elev[i]) }),
    );
    offset += km;
    days.push({
      day: ride.day,
      km: Math.round(km),
      line: simplify(line, 0.00015).map(([a, b]) => [round(a), round(b)]),
    });
    console.log(`${slug} day ${ride.day}: ${Math.round(km)} km, ${line.length} → ${days.at(-1).line.length} pts`);
  }

  await writeFile(
    new URL(`../data/routes/${slug}.json`, import.meta.url),
    JSON.stringify({ stops, days, walks, profile, marks }) + "\n",
  );
  console.log(`${slug}: ${Math.round(offset)} km, ${profile.length} profile samples`);
}

await mkdir(new URL("../data/routes/", import.meta.url), { recursive: true });
for (const [slug, trip] of Object.entries(TRIPS)) await buildTrip(slug, trip);
