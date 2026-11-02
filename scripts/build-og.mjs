// Renders the social share images (1200×630) into public/og/.
// Run with `npm run og:build` after changing trip headlines or photos.
//
// Images are static files rather than Next's opengraph-image routes so they
// survive `output: "export"` on any host. They're saved as JPEG (via macOS
// `sips`) to stay well under WhatsApp's ~300 KB preview limit.
import { ImageResponse } from "next/og.js";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const W = 1200;
const H = 630;

const C = { bg: "#f5f7fa", ink: "#0d1a33", ink2: "#3f4b63", muted: "#6b778d", line: "#dde3ec", red: "#d4402f", cobalt: "#1f5fd1" };

const font = (pkg, file) =>
  fetch(`https://cdn.jsdelivr.net/fontsource/fonts/${pkg}@latest/${file}`).then((r) => {
    if (!r.ok) throw new Error(`Font ${pkg}/${file}: ${r.status}`);
    return r.arrayBuffer();
  });

const fonts = [
  { name: "Bricolage", data: await font("bricolage-grotesque", "latin-700-normal.ttf"), weight: 700, style: "normal" },
  { name: "Bricolage", data: await font("bricolage-grotesque", "latin-500-normal.ttf"), weight: 500, style: "normal" },
  { name: "Instrument", data: await font("instrument-serif", "latin-400-italic.ttf"), weight: 400, style: "italic" },
];

const photo = async (path) => {
  const buf = await readFile(new URL(`public${path}`, root));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

const km = async (slug) => {
  const data = JSON.parse(await readFile(new URL(`data/routes/${slug}.json`, root), "utf8"));
  return data.days.reduce((s, d) => s + d.km, 0);
};

// Tiny element helper: satori takes React-like { type, props } objects.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat() },
});
const img = (src, style) => ({ type: "img", props: { src, style } });

const brand = () =>
  h(
    "div",
    { alignItems: "center", gap: 14 },
    h("div", { width: 44, height: 44, borderRadius: 13, background: C.ink, color: "#fff", fontSize: 15, fontWeight: 700, alignItems: "center", justifyContent: "center" }, "S&R"),
    h("div", { fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: -0.5 }, "Sarthak & Rahul"),
  );

const eyebrow = (text) => h("div", { fontSize: 18, fontWeight: 500, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }, text);

const stats = (items) =>
  h(
    "div",
    { gap: 36, paddingTop: 22, borderTop: `2px solid ${C.line}` },
    items.map(([value, label]) =>
      h("div", { flexDirection: "column" }, h("div", { fontSize: 40, fontWeight: 700, color: C.ink, letterSpacing: -1.5, lineHeight: 1.05 }, value), h("div", { fontSize: 18, fontWeight: 500, color: C.muted }, label)),
    ),
  );

const chip = (text) =>
  h(
    "div",
    { position: "absolute", left: 20, bottom: 20, alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.92)", fontSize: 20, fontWeight: 700, color: C.ink },
    h("div", { width: 10, height: 10, borderRadius: 999, background: C.red }),
    text,
  );

function tripCard({ index, region, title, titleSize, subtitle, statItems, image, caption }) {
  return h(
    "div",
    { width: W, height: H, background: C.bg, fontFamily: "Bricolage", padding: 36, gap: 44 },
    h(
      "div",
      { flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "14px 0 14px 18px" },
      brand(),
      h(
        "div",
        { flexDirection: "column", gap: 14 },
        eyebrow(`Itinerary ${index} · ${region}`),
        h("div", { fontSize: titleSize, fontWeight: 700, color: C.ink, letterSpacing: titleSize * -0.05, lineHeight: 0.86, marginLeft: -4 }, title),
        h("div", { fontFamily: "Instrument", fontStyle: "italic", fontSize: 46, color: C.ink2, lineHeight: 1 }, subtitle),
      ),
      stats(statItems),
    ),
    h("div", { position: "relative", width: 500, height: H - 72, borderRadius: 32, overflow: "hidden" }, img(image, { width: 500, height: H - 72, objectFit: "cover" }), chip(caption)),
  );
}

function splitCard({ heading, sub, foot, left, right }) {
  const panel = (p) =>
    h(
      "div",
      { position: "relative", flex: 1, height: H - 72, borderRadius: 28, overflow: "hidden" },
      img(p.image, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover" }),
      h("div", { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(180deg, rgba(8,18,40,0) 45%, rgba(8,18,40,0.78) 100%)" }),
      h(
        "div",
        { position: "absolute", left: 22, right: 22, bottom: 22, flexDirection: "column", color: "#fff" },
        h("div", { fontSize: 15, fontWeight: 500, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.9 }, p.index),
        h("div", { fontSize: 44, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }, p.name),
        h("div", { fontSize: 18, fontWeight: 500, opacity: 0.92, marginTop: 6 }, p.meta),
      ),
    );
  return h(
    "div",
    { width: W, height: H, background: C.bg, fontFamily: "Bricolage", padding: 36, gap: 36 },
    h(
      "div",
      { flexDirection: "column", justifyContent: "space-between", width: 470, padding: "14px 0 14px 18px" },
      brand(),
      h(
        "div",
        { flexDirection: "column", gap: 18 },
        h("div", { flexDirection: "column", color: C.ink }, heading),
        h("div", { fontSize: 26, fontWeight: 500, color: C.ink2, lineHeight: 1.3 }, sub),
      ),
      h("div", { fontSize: 20, fontWeight: 500, color: C.muted }, foot),
    ),
    h("div", { flex: 1, gap: 14 }, panel(left), panel(right)),
  );
}

async function render(node, width, height) {
  return Buffer.from(await new ImageResponse(node, { width, height, fonts }).arrayBuffer());
}

async function saveJpeg(node, name) {
  const png = new URL(`public/og/${name}.png`, root);
  const jpg = new URL(`public/og/${name}.jpg`, root);
  await writeFile(png, await render(node, W, H));
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "84", png.pathname, "--out", jpg.pathname], { stdio: "ignore" });
  await rm(png);
  const { size } = await stat(jpg);
  console.log(`public/og/${name}.jpg  ${Math.round(size / 1024)} KB`);
  if (size > 300 * 1024) throw new Error(`${name}.jpg is over 300 KB; WhatsApp may skip it`);
}

await mkdir(new URL("public/og/", root), { recursive: true });

const [kalKm, musKm] = [await km("kalinchowk"), await km("mustang")];

await saveJpeg(
  tripCard({
    index: "01",
    region: "Dolakha, Nepal",
    title: "Kuri",
    titleSize: 200,
    subtitle: "and the road to Kalinchowk",
    statItems: [["4", "days"], [String(kalKm), "km of road"], ["3,842", "m high point"]],
    image: await photo("/images/ours/kuri-village.jpg"),
    caption: "Kuri Village · 3,450 m",
  }),
  "kalinchowk",
);

await saveJpeg(
  tripCard({
    index: "02",
    region: "Lower Mustang, Nepal",
    title: "Muktinath",
    titleSize: 118,
    subtitle: "chasing November snow",
    statItems: [["4", "days · Thu–Sun"], [String(musKm), "km of road"], ["3,710", "m high point"]],
    image: await photo("/images/mustang/muktinath-snow.jpg"),
    caption: "Muktinath · 3,710 m",
  }),
  "mustang",
);

const kalPhoto = await photo("/images/web/kalinchowk-snow.jpg");
const musPhoto = await photo("/images/mustang/muktinath-snow.jpg");
const bold = (text, size) => h("div", { fontSize: size, fontWeight: 700, letterSpacing: size * -0.05, lineHeight: 0.9 }, text);
const italic = (text, size) => h("div", { fontFamily: "Instrument", fontStyle: "italic", fontSize: size, lineHeight: 0.85 }, text);

await saveJpeg(
  splitCard({
    heading: [bold("Pick a", 124), italic("ride.", 150)],
    sub: "Two 4-day motorbike itineraries from Kathmandu, into the snow.",
    foot: "Yamaha MT-15 + Hero XPulse 200 4V",
    left: { index: "Itinerary 01", name: "Kalinchowk", meta: `4 days · ${kalKm} km · 3,842 m`, image: kalPhoto },
    right: { index: "Itinerary 02", name: "Mustang", meta: `4 days · ${musKm} km · 3,710 m`, image: musPhoto },
  }),
  "home",
);

await saveJpeg(
  splitCard({
    heading: [bold("Kalinchowk", 82), italic("vs", 104), bold("Mustang.", 82)],
    sub: "Distance, altitude, budget and snow, compared.",
    foot: "Which 4-day ride should we pick?",
    left: { index: "Relaxed & cheaper", name: "Kalinchowk", meta: `${kalKm} km · 3,842 m`, image: kalPhoto },
    right: { index: "Big & snowy", name: "Mustang", meta: `${musKm} km · 3,710 m`, image: musPhoto },
  }),
  "compare",
);
