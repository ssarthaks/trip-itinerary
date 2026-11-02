import type { RouteData, Trip } from "./types";
import { commons, ours } from "./photos";
import kalinchowkRoute from "./routes/kalinchowk.json";
import mustangRoute from "./routes/mustang.json";

export const routes: Record<Trip["slug"], RouteData> = {
  kalinchowk: kalinchowkRoute as RouteData,
  mustang: mustangRoute as RouteData,
};

const km = (slug: Trip["slug"], day: number) =>
  `${routes[slug].days.find((d) => d.day === day)?.km ?? "—"} km`;

export const totalKm = (slug: Trip["slug"]) =>
  routes[slug].days.reduce((sum, d) => sum + d.km, 0);

export const riders = [
  {
    name: "Sarthak",
    bike: "Yamaha MT-15",
    photo: ours.mt15,
    specs: [
      { value: "155", label: "cc · liquid-cooled" },
      { value: "18.4", label: "PS" },
      { value: "10", label: "litre tank" },
    ],
    note: "Street-bred and light. Smooth throttle on the gravel.",
  },
  {
    name: "Rahul",
    bike: "Hero XPulse 200 4V",
    photo: commons("web", "xpulse.jpg"),
    specs: [
      { value: "200", label: "cc · 4-valve" },
      { value: "19.1", label: "PS" },
      { value: "13", label: "litre tank" },
    ],
    note: "Long-travel dual-sport. Leads on the rough stuff.",
  },
];

const commonChecklist = [
  "Helmets & riding gloves",
  "Windproof, waterproof jackets",
  "Thermal layers",
  "Sturdy boots",
  "Licence + bike bluebooks",
  "Puncture kit & chain lube",
  "Power bank & headlamp",
  "Cash for lodges & tickets",
];

export const kalinchowk: Trip = {
  slug: "kalinchowk",
  index: "01",
  name: "Kalinchowk",
  region: "Dolakha, Nepal",
  title: "Kuri",
  subtitle: "and the road to Kalinchowk",
  tagline: "Colourful alpine village, a sunrise temple hike and the old Everest trailhead.",
  hero: ours.village,
  heroCaption: "Kuri Village · 3,450 m",
  card: commons("web", "kalinchowk-snow.jpg"),
  finale: commons("web", "himalaya-range.jpg"),
  peak: { name: "Kalinchowk", m: 3842 },
  heroStats: [
    { value: "4", label: "days" },
    { value: `${totalKm("kalinchowk")}`, label: "km of road" },
    { value: "3,842", label: "m high point" },
    { value: "2", label: "bikes" },
  ],
  stopNames: {
    kathmandu: "Kathmandu",
    banepa: "Banepa",
    dhulikhel: "Dhulikhel",
    mude: "Mude",
    lamosangu: "Lamosangu",
    charikot: "Charikot",
    kuri: "Kuri Village",
    kalinchowk: "Kalinchowk Bhagwati",
    dolakha: "Dolakha Bhimsen",
    jiri: "Jiri",
  },
  summit: { key: "kalinchowk", label: "Kalinchowk Bhagwati · 3,842 m", via: "kuri" },
  overnight: ["kuri", "jiri"],
  days: [
    {
      n: 1,
      title: "Kathmandu → Kuri",
      kicker: "Into the hills",
      summary: "Out of the valley, over the ridges, up through the pines to 3,450 m.",
      chain: ["Kathmandu", "Banepa", "Dhulikhel", "Mude", "Charikot", "Kuri"],
      stats: [
        { value: km("kalinchowk", 1), label: "by road" },
        { value: "6–7 h", label: "riding" },
        { value: "3,450 m", label: "tonight" },
      ],
      highlights: [
        "Araniko Highway out of the valley, through Banepa & Dhulikhel",
        "Past Mude: rhododendron forest and rural ridge roads",
        "Lunch at Charikot over the Sunkoshi & Tamakoshi valleys",
        "Dirt & gravel climb through pine forest to Kuri",
      ],
      night: "Lodge in Kuri. Walk the village, then a bonfire.",
      photos: [commons("web", "araniko-highway.jpg"), commons("web", "rhododendron.jpg"), ours.blueSky],
    },
    {
      n: 2,
      title: "Kalinchowk & Dolakha",
      kicker: "Sunrise at 3,842 m",
      summary: "A pre-dawn climb to the temple, then a lazy ride to Dolakha's old Bhimsen shrine.",
      chain: ["Kuri", "Kalinchowk Bhagwati", "Kuri", "Dolakha", "Kuri"],
      stats: [
        { value: "45–60 min", label: "hike up" },
        { value: km("kalinchowk", 2), label: "ride, return" },
        { value: "3,842 m", label: "summit" },
      ],
      highlights: [
        "Hike to Kalinchowk Bhagwati Temple before sunrise",
        "Gaurishankar, Langtang & Ganesh Himal turning gold",
        "Feeling lazy? Take the cable car up instead",
        "Breakfast in Kuri, then down to Dolakha Bhimsen Temple",
      ],
      night: "Second night in Kuri, or a lower valley guesthouse.",
      photos: [commons("web", "kalinchowk-temple.jpg"), ours.aerial, commons("web", "dolakha-bhimsen.jpg")],
    },
    {
      n: 3,
      title: "Kuri → Jiri",
      kicker: "The gateway to Everest",
      summary: "Down rugged backroads and terraced villages to the 'Switzerland of Nepal'.",
      chain: ["Kuri", "Charikot", "Jiri"],
      stats: [
        { value: km("kalinchowk", 3), label: "by road" },
        { value: "4–5 h", label: "riding" },
        { value: "1,905 m", label: "Jiri" },
      ],
      highlights: [
        "Descend through pine forest and terraced hill villages",
        "Jiri: the classic Everest trailhead before Lukla airport",
        "Quiet green valleys, Sherpa & Tamang culture",
      ],
      night: "Hotel or lodge in Jiri.",
      note: { label: "Plan B", text: "Skip Jiri and keep a third night in the snow at Kuri." },
      photos: [commons("web", "jiri.jpg"), commons("web", "terraces.jpg"), ours.houses],
    },
    {
      n: 4,
      title: "Jiri → Kathmandu",
      kicker: "The long way home",
      summary: "River corridors and hillside highway, back in the valley by late afternoon.",
      chain: ["Jiri", "Charikot", "Lamosangu", "Dhulikhel", "Kathmandu"],
      stats: [
        { value: km("kalinchowk", 4), label: "by road" },
        { value: "6–7 h", label: "riding" },
        { value: "Home", label: "tonight" },
      ],
      highlights: [
        "Morning departure along the Tamakoshi & Sunkoshi",
        "Rejoin the Araniko Highway at Lamosangu / Khadichaur",
        "Final stretch into the Kathmandu Valley",
      ],
      night: "Home. Clean the bikes. Plan the next one.",
      photos: [commons("web", "tamakoshi.jpg"), commons("web", "charikot.jpg"), commons("web", "gaurishankar.jpg")],
    },
  ],
  tips: [
    {
      title: "Gear",
      text: "Windproof, waterproof jackets, thermal layers and sturdy boots. Nights in Kuri are freezing.",
    },
    {
      title: "Roads",
      text: "Smooth blacktop, then rough, dusty or muddy patches towards Kuri and Jiri. Slippery in winter snow.",
    },
    {
      title: "Fuel",
      text: "Top up in Charikot. It's the last town before the climb to Kuri.",
    },
    {
      title: "Permits",
      text: "Check whether a Gaurishankar Conservation Area entry permit is needed for the route.",
    },
  ],
  checklist: commonChecklist,
  weather: { place: "Kuri Village", lat: 27.7594, lon: 86.0475 },
  budget: {
    basis: "pair",
    covers: "fuel, three nights, food and the cable car",
    rows: [
      {
        category: "Fuel",
        low: 4000,
        high: 5500,
        note: "Two bikes, mountain riding, steep off-road climbs and idling.",
      },
      {
        category: "Lodging · 3 nights",
        low: 6000,
        high: 9000,
        note: "Standard room for two, e.g. Kalinchowk Tripura Resort at ~NPR 2,500–3,250 a night.",
      },
      {
        category: "Meals & snacks",
        low: 7000,
        high: 11000,
        note: "Dal bhat, Jimbu aloo, snacks and drinks over four days.",
      },
      {
        category: "Cable car",
        low: 1200,
        high: 1200,
        note: "NPR 600 each, two-way, Kuri to the temple ridge.",
      },
    ],
    alternatives: [
      { value: "NPR 13,000", label: "per person · agency, shared jeep" },
      { value: "US$ 595", label: "per person · private luxury tour" },
    ],
    insights: [
      {
        title: "Veg vs non-veg",
        text: "Veg meals can feel overpriced up at Kuri. Chicken sets or stick food are often better value.",
      },
      {
        title: "Winter rooms",
        text: "Dec–Feb nights drop well below freezing. Ask for glass-wool insulated walls or electric blankets.",
      },
    ],
  },
};

export const mustang: Trip = {
  slug: "mustang",
  index: "02",
  name: "Mustang",
  region: "Lower Mustang, Nepal",
  title: "Muktinath",
  subtitle: "chasing November snow",
  tagline: "The world's deepest gorge, a high-altitude desert and fresh snow at 3,710 m.",
  hero: commons("mustang", "muktinath-snow.jpg"),
  heroCaption: "Muktinath · 3,710 m",
  card: commons("mustang", "muktinath-snow.jpg"),
  finale: commons("mustang", "muktinath-snow.jpg"),
  peak: { name: "Muktinath", m: 3710 },
  heroStats: [
    { value: "4", label: "days · Thu–Sun" },
    { value: `${totalKm("mustang")}`, label: "km of road" },
    { value: "3,710", label: "m high point" },
    { value: "20 min", label: "walking, total" },
  ],
  stopNames: {
    kathmandu: "Kathmandu",
    mugling: "Mugling",
    pokhara: "Pokhara",
    beni: "Beni",
    tatopani: "Tatopani",
    marpha: "Marpha",
    jomsom: "Jomsom",
    kagbeni: "Kagbeni",
    ranipauwa: "Muktinath parking",
    muktinath: "Muktinath Temple",
  },
  summit: { key: "muktinath", label: "Muktinath Temple · 3,710 m", via: "ranipauwa" },
  overnight: ["tatopani", "ranipauwa", "pokhara"],
  days: [
    {
      n: 1,
      weekday: "Thursday",
      title: "Kathmandu → Tatopani",
      kicker: "The long push",
      summary: "A long tarmac day down the Prithvi Highway, past Pokhara and Beni to the hot springs.",
      chain: ["Kathmandu", "Mugling", "Pokhara", "Beni", "Tatopani"],
      stats: [
        { value: km("mustang", 1), label: "by road" },
        { value: "9–10 h", label: "riding" },
        { value: "Hot springs", label: "tonight" },
      ],
      highlights: [
        "Prithvi Highway tarmac all the way to Pokhara",
        "On through Beni and up the Kali Gandaki to Tatopani",
        "Soak sore muscles in the riverside hot springs",
      ],
      night: "Tatopani. Hot springs, then sleep.",
      photos: [commons("mustang", "prithvi-highway.jpg"), commons("mustang", "beni.jpg"), commons("mustang", "tatopani.jpg")],
    },
    {
      n: 2,
      weekday: "Friday",
      title: "Tatopani → Muktinath",
      kicker: "The snow zone",
      summary: "An epic off-road climb through the Kali Gandaki gorge into a wind-swept high desert.",
      chain: ["Tatopani", "Marpha", "Jomsom", "Kagbeni", "Muktinath"],
      stats: [
        { value: km("mustang", 2), label: "off-road" },
        { value: "5–6 h", label: "riding" },
        { value: "3,710 m", label: "Muktinath" },
      ],
      highlights: [
        "Up the Kali Gandaki, the deepest gorge in the world",
        "Through Marpha & Jomsom into a freezing high desert",
        "Refuel fully at Jomsom before the final climb",
        "Park at Muktinath, walk 15–20 min up to the temple",
      ],
      night: "Muktinath, at the foot of Thorong La. Snow on the ridges.",
      photos: [commons("mustang", "kali-gandaki.jpg"), commons("mustang", "kagbeni.jpg"), commons("mustang", "muktinath-temple.jpg")],
    },
    {
      n: 3,
      weekday: "Saturday",
      title: "Muktinath → Pokhara",
      kicker: "The great descent",
      summary: "Frozen morning views, then a long, thrilling ride down to warm Lakeside.",
      chain: ["Muktinath", "Jomsom", "Beni", "Pokhara"],
      stats: [
        { value: km("mustang", 3), label: "by road" },
        { value: "7–8 h", label: "riding" },
        { value: "Lakeside", label: "tonight" },
      ],
      highlights: [
        "Wake early for Dhaulagiri & Nilgiri in fresh snow",
        "A long descent back down the gorge",
        "Warm night in Lakeside, Pokhara",
      ],
      night: "Lakeside, Pokhara.",
      photos: [commons("mustang", "dhaulagiri.jpg"), commons("mustang", "jomsom.jpg"), commons("mustang", "marpha.jpg")],
    },
    {
      n: 4,
      weekday: "Sunday",
      title: "Pokhara → Kathmandu",
      kicker: "Cruise home",
      summary: "A smooth final run on the highway to wrap up the snow chase.",
      chain: ["Pokhara", "Mugling", "Kathmandu"],
      stats: [
        { value: km("mustang", 4), label: "by road" },
        { value: "6–7 h", label: "riding" },
        { value: "Home", label: "tonight" },
      ],
      highlights: [
        "Easy highway cruise out of Pokhara",
        "Down to Mugling, then up the Prithvi Highway",
        "Home by evening",
      ],
      night: "Home. Clean the bikes. Plan the next one.",
      photos: [commons("mustang", "pokhara.jpg"), commons("mustang", "nilgiri.jpg"), commons("mustang", "mustang-road.jpg")],
    },
  ],
  tips: [
    {
      title: "Bike check",
      text: "Deep-tread tyres for loose gravel past Beni and possible black ice near Muktinath.",
    },
    {
      title: "Severe cold",
      text: "Well below 0 °C at night and intense windchill. Heavy windproof jackets, thermals and insulated gloves are mandatory.",
    },
    {
      title: "Fuel",
      text: "Refuel fully at Jomsom before the final steep climb to Muktinath.",
    },
    {
      title: "Permits",
      text: "Jomsom and Muktinath sit inside the Annapurna Conservation Area. As Nepali citizens we just pay a small entry fee at the ACAP checkpoint.",
    },
  ],
  checklist: [...commonChecklist, "Insulated winter gloves", "Swimwear for Tatopani"],
  weather: { place: "Muktinath", lat: 28.8167, lon: 83.8713 },
  budget: {
    basis: "rider",
    covers: "fuel and oil, ACAP entry, three nights, food and a repair buffer",
    rows: [
      {
        category: "Fuel & engine oil",
        low: 4500,
        high: 6000,
        note: "About 750 km with steep high-altitude climbs and rough off-road. Includes a buffer for pricier fuel up high.",
      },
      {
        category: "ACAP entry",
        low: 100,
        high: 100,
        note: "Nominal fee for Nepali citizens at the checkpoint. No TIMS card or international permits needed.",
      },
      {
        category: "Lodging · 3 nights",
        low: 2400,
        high: 4500,
        note: "Budget rooms or teahouses in Tatopani, Muktinath and Pokhara, roughly NPR 800–1,500 a night.",
      },
      {
        category: "Food & drinks",
        low: 4000,
        high: 5500,
        note: "Dal bhat for fuel, hot tea, snacks and bottled water. Prices rise as you climb.",
      },
      {
        category: "Buffer",
        low: 1500,
        high: 2000,
        note: "Punctures or cables, mobile top-ups and the Tatopani hot springs.",
      },
    ],
    insights: [
      {
        title: "Teahouse deal",
        text: "Many Mustang teahouses discount the room, or waive it, if you eat dinner and breakfast there.",
      },
      {
        title: "Carry cash",
        text: "Draw enough in Pokhara or Beni. ATMs up high fail in the cold, and wallets fail where there's no signal.",
      },
    ],
  },
};

export const trips = { kalinchowk, mustang } satisfies Record<Trip["slug"], Trip>;
export const tripList = [kalinchowk, mustang];
