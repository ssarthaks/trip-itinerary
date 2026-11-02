"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { tripNav, type TripSlug } from "./nav";

export default function Header() {
  const pathname = usePathname();
  const slug = (Object.keys(tripNav) as TripSlug[]).find((s) => pathname.startsWith(`/${s}`));
  const sections = slug ? tripNav[slug].sections : [];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.classList.add("menu-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!slug) return;
    const targets = document.querySelectorAll<HTMLElement>("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          setActive(id.startsWith("day-") ? "day-1" : id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [slug, pathname]);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Sarthak & Rahul — choose an itinerary">
          <span className="brand-mark" aria-hidden="true">S&amp;R</span>
          <span className="brand-text">Sarthak &amp; Rahul</span>
        </Link>

        <nav className="switcher" aria-label="Itinerary">
          {(Object.keys(tripNav) as TripSlug[]).map((s) => (
            <Link
              key={s}
              href={`/${s}/`}
              className="switcher-link"
              aria-current={s === slug ? "page" : undefined}
            >
              {tripNav[s].name}
            </Link>
          ))}
        </nav>

        {slug && (
          <>
            <nav className="section-links" aria-label="Sections">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
                  {s.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="menu-button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span className="menu-icon" aria-hidden="true" />
            </button>
          </>
        )}
        {slug && <div className="progress" aria-hidden="true" />}
      </header>

      {slug && (
        <div id="site-menu" className="menu" data-open={open} hidden={!open}>
          <p className="eyebrow">{tripNav[slug].name} itinerary</p>
          <ul>
            <li>
              <a href="#top" onClick={() => setOpen(false)}>Top</a>
            </li>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/" className="menu-switch">
            Choose another ride →
          </Link>
        </div>
      )}
    </>
  );
}
