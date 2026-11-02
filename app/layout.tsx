import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import Header from "@/components/Header";
import { authors, pageMetadata, siteName, siteUrl } from "@/lib/site";
import { homeSeo } from "@/data/seo";
import "./globals.css";

const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  ...pageMetadata(homeSeo),
  title: {
    default: homeSeo.title,
    template: "%s · Sarthak & Rahul",
  },
  applicationName: siteName,
  authors,
  creator: "Sarthak & Rahul",
  publisher: "Sarthak & Rahul",
  category: "travel",
  keywords: [
    "Kalinchowk",
    "Kuri Village",
    "Kalinchowk Bhagwati",
    "Dolakha",
    "Jiri",
    "Muktinath",
    "Lower Mustang",
    "Jomsom",
    "Kali Gandaki",
    "Nepal motorbike itinerary",
    "Nepal bike ride",
    "Kathmandu road trip",
    "Yamaha MT-15",
    "Hero XPulse 200 4V",
  ],
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f7fa",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} data-scroll-behavior="smooth">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
