"use client";

import { useEffect, useState } from "react";

type Forecast = {
  current: { temperature_2m: number; apparent_temperature: number; wind_speed_10m: number; weather_code: number };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    snowfall_sum: number[];
    weather_code: number[];
  };
};

// WMO weather codes, grouped.
function describe(code: number) {
  if (code === 0) return { label: "Clear", icon: "☀" };
  if (code <= 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁" };
  if (code <= 48) return { label: "Fog", icon: "〰" };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Rain", icon: "☂" };
  if (code <= 77 || code === 85 || code === 86) return { label: "Snow", icon: "❄" };
  return { label: "Storm", icon: "⚡" };
}

const deg = (n: number) => `${Math.round(n)}°`;

export default function Weather({ place, lat, lon }: { place: string; lat: number; lon: number }) {
  const [data, setData] = useState<Forecast | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,weather_code&forecast_days=5&timezone=Asia%2FKathmandu";
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: Forecast) => setData(json))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) setFailed(true);
      });
    return () => ctrl.abort();
  }, [lat, lon]);

  const now = data && describe(data.current.weather_code);

  return (
    <div className="card weather">
      <p className="card-title">Right now in {place}</p>
      {failed ? (
        <p className="weather-empty">Live weather is unavailable right now. Check again before you leave.</p>
      ) : !data || !now ? (
        <div className="weather-skeleton" aria-label="Loading weather" />
      ) : (
        <>
          <p className="weather-now">
            <span className="weather-temp">{deg(data.current.temperature_2m)}</span>
            <span className="weather-icon" aria-hidden="true">{now.icon}</span>
          </p>
          <p className="weather-meta">
            {now.label} · feels {deg(data.current.apparent_temperature)} · wind {Math.round(data.current.wind_speed_10m)} km/h
          </p>
          <ul className="weather-days">
            {data.daily.time.slice(1).map((t, i) => {
              const d = describe(data.daily.weather_code[i + 1]);
              const snow = data.daily.snowfall_sum[i + 1];
              return (
                <li key={t}>
                  <span className="weather-day">
                    {new Date(`${t}T00:00`).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span aria-label={d.label} title={d.label}>{d.icon}</span>
                  <span className="weather-range">
                    {deg(data.daily.temperature_2m_min[i + 1])} / {deg(data.daily.temperature_2m_max[i + 1])}
                  </span>
                  {snow > 0 && <span className="weather-snow">{snow.toFixed(1)} cm snow</span>}
                </li>
              );
            })}
          </ul>
          <p className="weather-src">Forecast · Open-Meteo</p>
        </>
      )}
    </div>
  );
}
