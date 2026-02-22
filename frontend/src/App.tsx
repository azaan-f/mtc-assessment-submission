import { useEffect, useMemo, useState } from "react";
import './App.css'

type RamadanDay = {
  date: string;  
  sahur: string; // 5:42 AM or 05:42
  iftar: string; // 5:48 PM or 17:48
};

type NextEvent = {
  label: "Sahur" | "Iftar";
  at: Date;
  day: RamadanDay;
};

function getLocalYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}



function formatUSDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function parseTimeToLocalDate(dateStr: string, timeStr: string): Date {
  // 24h and 12 hr AM/PM
  const [y, m, d] = dateStr.split("-").map(Number);

  const t = timeStr.trim();
  let hours = 0;
  let minutes = 0;

  const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    hours = Number(ampmMatch[1]);
    minutes = Number(ampmMatch[2]);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    const match24 = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match24) {
      return new Date(`${dateStr} ${timeStr}`);
    }
    hours = Number(match24[1]);
    minutes = Number(match24[2]);
  }

  return new Date(y, m - 1, d, hours, minutes, 0, 0);
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function App() {
  const [days, setDays] = useState<RamadanDay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Hardcoded sample location
  const lat = 40.7128;
  const lon = -74.006;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch(`http://127.0.0.1:8000/ramadan?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data: RamadanDay[] = await res.json();
        if (!cancelled) setDays(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tick every second for live countdown
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const todayStr = useMemo(() => getLocalYYYYMMDD(now), [now]);

  const nextEvent: NextEvent | null = useMemo(() => {
    if (days.length === 0) return null;

    // Find today's day in the Ramadan list
    const idxToday = days.findIndex((d) => d.date === todayStr);

    const considerDay = (d: RamadanDay): NextEvent | null => {
      const sahurAt = parseTimeToLocalDate(d.date, d.sahur);
      const iftarAt = parseTimeToLocalDate(d.date, d.iftar);

      if (now < sahurAt) return { label: "Sahur", at: sahurAt, day: d };
      if (now < iftarAt) return { label: "Iftar", at: iftarAt, day: d };
      return null;
    };

    if (idxToday !== -1) {
      const ev = considerDay(days[idxToday]);
      if (ev) return ev;

      // After todays iftar -> next is tomorrow sahur (if exists)
      if (idxToday + 1 < days.length) {
        const tomorrow = days[idxToday + 1];
        return { label: "Sahur", at: parseTimeToLocalDate(tomorrow.date, tomorrow.sahur), day: tomorrow };
      }
      // Past last day
      return null;
    }

    for (const d of days) {
      const ev = considerDay(d);
      if (ev) return ev;
    }

    return null;
  }, [days, now, todayStr]);

  const countdownMs = nextEvent ? nextEvent.at.getTime() - now.getTime() : 0;

  return (
    <div className="page">
      <header className="header">
        <div className="titleBlock">
          <div className="badge">رمضان</div>
          <h1>Ramadan Calendar</h1>
          <p className="subtitle">
            Sahur and Iftar times
          </p>
        </div>

        <div className="meta">
          <div className="metaItem">
            <div className="metaLabel">Location</div>
            <div className="metaValue">{lat}, {lon}</div>
          </div>
          <div className="metaItem">
            <div className="metaLabel">Today</div>
            <div className="metaValue">{formatUSDate(todayStr)}</div>
          </div>
        </div>
      </header>

      {error && (
        <div className="alert">
          <strong>Could not load calendar.</strong>
          <div className="alertBody">{error}</div>
          <div className="alertHint">Make sure the backend is running on port 8000.</div>
        </div>
      )}

      {!error && days.length === 0 && <div className="loading">Loading…</div>}

      {!error && days.length > 0 && (
        <>
          <section className="countdownCard">
            <div className="countdownTop">
              <h2>Next</h2>
              {nextEvent ? (
                <div className="nextInfo">
                  <span className="pill">{nextEvent.label}</span>
                  <span className="nextWhen">
                    {formatUSDate(nextEvent.day.date)} • {nextEvent.label === "Sahur" ? nextEvent.day.sahur : nextEvent.day.iftar}
                  </span>
                </div>
              ) : (
                <div className="nextInfo">
                  <span className="nextWhen">No upcoming event found.</span>
                </div>
              )}
            </div>

            <div className="timer">
              {nextEvent ? formatDuration(countdownMs) : "--:--:--"}
            </div>

            <div className="timerHint">
              Updates every second
            </div>
          </section>

          <section className="gridWrap">
            <h2 className="sectionTitle">30 Days</h2>
            <div className="grid">
              {days.map((d) => {
                const isToday = d.date === todayStr;
                return (
                  <div key={d.date} className={`card ${isToday ? "today" : ""}`}>
                    <div className="cardTop">
                      <div className="date">{formatUSDate(d.date)}</div>
                      {isToday && <div className="todayTag">Today</div>}
                    </div>

                    <div className="row">
                      <span className="label">Sahur</span>
                      <span className="value">{d.sahur}</span>
                    </div>
                    <div className="row">
                      <span className="label">Iftar</span>
                      <span className="value">{d.iftar}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      
    </div>
  );
}

export default App;