"use client";

import { useSyncExternalStore } from "react";

const CHANGE = "checklist:change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function parse(raw: string, items: string[]): string[] {
  try {
    const saved: unknown = JSON.parse(raw);
    return Array.isArray(saved) ? saved.filter((s): s is string => typeof s === "string" && items.includes(s)) : [];
  } catch {
    return [];
  }
}

export default function Checklist({ storageKey, items }: { storageKey: string; items: string[] }) {
  // Ticks live in this device's localStorage; the server render always starts empty.
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) ?? "[]";
      } catch {
        return "[]";
      }
    },
    () => "[]",
  );
  const done = parse(raw, items);

  const toggle = (item: string) => {
    const next = done.includes(item) ? done.filter((d) => d !== item) : [...done, item];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage blocked — ticks can't persist.
    }
    window.dispatchEvent(new Event(CHANGE));
  };

  return (
    <div className="card checklist">
      <div className="checklist-head">
        <p className="card-title">Packing list</p>
        <p className="checklist-count" aria-live="polite">
          {done.length}/{items.length} packed
        </p>
      </div>
      <div className="checklist-bar" aria-hidden="true">
        <span style={{ width: `${(done.length / items.length) * 100}%` }} />
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <label>
              <input type="checkbox" checked={done.includes(item)} onChange={() => toggle(item)} />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
