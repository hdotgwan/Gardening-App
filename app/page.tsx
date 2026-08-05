"use client";

import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type Tab = "today" | "journal" | "plan" | "plants";

type PlantProfile = {
  key: string;
  name: string;
  variety: string;
  emoji: string;
  accent: string;
  keywords: string[];
  sunlight: string;
  water: string;
  soil: string;
  spacing: string;
  harvest: string;
  issue: string;
  tip: string;
};

type GardenItem = {
  id: number;
  kind: "bed" | "plant" | "water" | "seat";
  label: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const profiles: PlantProfile[] = [
  {
    key: "bean",
    name: "French bean",
    variety: "Phaseolus vulgaris",
    emoji: "🫛",
    accent: "#d9b96e",
    keywords: ["french bean", "green bean", "runner bean", "beans", "bean"],
    sunlight: "Full sun",
    water: "Keep evenly moist",
    soil: "Free-draining, fertile",
    spacing: "15 cm apart",
    harvest: "8–12 weeks",
    issue: "Slugs love young shoots; protect seedlings and avoid waterlogged roots.",
    tip: "Add supports before sowing climbing varieties, then water most once flowers appear.",
  },
  {
    key: "tomato",
    name: "Tomato",
    variety: "Solanum lycopersicum",
    emoji: "🍅",
    accent: "#dc6b4f",
    keywords: ["tomatoes", "tomato"],
    sunlight: "6–8 hours sun",
    water: "Deep, consistent watering",
    soil: "Rich and free-draining",
    spacing: "45–60 cm apart",
    harvest: "12–16 weeks",
    issue: "Irregular watering can cause split fruit and blossom-end rot.",
    tip: "Water at soil level and feed weekly once the first fruits begin to form.",
  },
  {
    key: "lavender",
    name: "English lavender",
    variety: "Lavandula angustifolia",
    emoji: "🪻",
    accent: "#8d79a8",
    keywords: ["lavender"],
    sunlight: "Full sun",
    water: "Low once established",
    soil: "Very free-draining",
    spacing: "45 cm apart",
    harvest: "Flowers in summer",
    issue: "Winter wet is a bigger risk than cold; heavy soil can rot the roots.",
    tip: "Mix grit into heavy soil and trim after flowering without cutting old wood.",
  },
  {
    key: "lettuce",
    name: "Leaf lettuce",
    variety: "Lactuca sativa",
    emoji: "🥬",
    accent: "#8fad72",
    keywords: ["lettuce", "salad leaves"],
    sunlight: "Sun or light shade",
    water: "Little and often",
    soil: "Moist, fertile",
    spacing: "20–30 cm apart",
    harvest: "6–10 weeks",
    issue: "Dry spells cause bitter leaves and bolting; watch for slugs.",
    tip: "Sow a short row every fortnight for a steady supply rather than one big crop.",
  },
];

const initialItems: GardenItem[] = [
  { id: 1, kind: "bed", label: "Sunny bed", emoji: "", x: 8, y: 10, w: 49, h: 24 },
  { id: 2, kind: "plant", label: "Beans", emoji: "🫛", x: 18, y: 17, w: 16, h: 12 },
  { id: 3, kind: "plant", label: "Lavender", emoji: "🪻", x: 38, y: 17, w: 16, h: 12 },
  { id: 4, kind: "water", label: "Pond", emoji: "💧", x: 63, y: 47, w: 27, h: 20 },
  { id: 5, kind: "seat", label: "Bench", emoji: "", x: 17, y: 73, w: 30, h: 10 },
];

const starterTasks = [
  { id: 1, day: "Today", title: "Water French beans", detail: "Back bed · 2 min", emoji: "💧", done: false },
  { id: 2, day: "Fri 7", title: "Check bean supports", detail: "New growth may need tying in", emoji: "🪴", done: false },
  { id: 3, day: "24 Sep", title: "First likely harvest", detail: "Pick young pods regularly", emoji: "🫛", done: false },
];

const nav: { id: Tab; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "⌂" },
  { id: "journal", label: "Journal", icon: "✎" },
  { id: "plan", label: "My plot", icon: "▦" },
  { id: "plants", label: "Plants", icon: "♧" },
];

function PlantAdvice({ plant, compact = false }: { plant: PlantProfile; compact?: boolean }) {
  return (
    <article className={`advice-card ${compact ? "compact" : ""}`} style={{ "--plant-accent": plant.accent } as CSSProperties}>
      <div className="plant-heading">
        <div className="plant-avatar">{plant.emoji}</div>
        <div>
          <span className="eyebrow">Plant recognised</span>
          <h3>{plant.name}</h3>
          <p>{plant.variety}</p>
        </div>
        <span className="confidence">96%</span>
      </div>
      {!compact && (
        <>
          <div className="care-grid">
            <div><span>☀</span><small>Light</small><strong>{plant.sunlight}</strong></div>
            <div><span>◉</span><small>Water</small><strong>{plant.water}</strong></div>
            <div><span>↔</span><small>Spacing</small><strong>{plant.spacing}</strong></div>
            <div><span>⌛</span><small>Harvest</small><strong>{plant.harvest}</strong></div>
          </div>
          <div className="garden-note"><span>Good to know</span><p>{plant.tip}</p></div>
          <div className="issue-note"><span>Watch out</span><p>{plant.issue}</p></div>
        </>
      )}
    </article>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [journal, setJournal] = useState("");
  const [recognized, setRecognized] = useState<PlantProfile | null>(null);
  const [tasks, setTasks] = useState(starterTasks);
  const [items, setItems] = useState(initialItems);
  const [toast, setToast] = useState("");
  const [savedEntries, setSavedEntries] = useState([
    { date: "2 Aug", text: "Planted French beans in the sunny back bed.", plant: profiles[0] },
    { date: "28 Jul", text: "Lavender is flowering well after the dry week.", plant: profiles[2] },
  ]);
  const drag = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const detectPlant = (text: string) => {
    const lower = text.toLowerCase();
    return profiles.find((profile) => profile.keywords.some((keyword) => lower.includes(keyword))) ?? null;
  };

  const analyseEntry = () => {
    const plant = detectPlant(journal);
    setRecognized(plant);
    if (!plant) showToast("Add a plant name and I’ll find its care needs");
  };

  const saveEntry = async () => {
    if (!journal.trim()) return;
    const plant = recognized ?? detectPlant(journal);
    setSavedEntries((current) => [
      { date: "Today", text: journal.trim(), plant: plant ?? profiles[0] },
      ...current,
    ]);
    if (plant) {
      setTasks((current) => [
        { id: Date.now(), day: "Tomorrow", title: `Check soil around ${plant.name.toLowerCase()}`, detail: "Water if the top 3 cm feels dry", emoji: "💧", done: false },
        { id: Date.now() + 1, day: "In 1 week", title: `Check ${plant.name.toLowerCase()} progress`, detail: plant.tip, emoji: plant.emoji, done: false },
        ...current,
      ]);
    }
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: journal.trim(), plantKey: plant?.key ?? null }),
      });
    } catch {
      // The interactive prototype remains useful while the hosted database starts.
    }
    setJournal("");
    setRecognized(null);
    showToast(plant ? `${plant.name} saved · 2 care reminders added` : "Journal note saved");
  };

  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      showToast("Notifications aren’t supported in this browser");
      return;
    }
    const result = await Notification.requestPermission();
    showToast(result === "granted" ? "Garden reminders are on" : "You can enable reminders in phone settings");
  };

  const addItem = (kind: GardenItem["kind"]) => {
    const defaults = {
      bed: { label: "New bed", emoji: "", w: 46, h: 20 },
      plant: { label: "New plant", emoji: "🌱", w: 18, h: 12 },
      water: { label: "Water", emoji: "💧", w: 26, h: 18 },
      seat: { label: "Bench", emoji: "", w: 28, h: 10 },
    }[kind];
    setItems((current) => [...current, { id: Date.now(), kind, x: 34, y: 38, ...defaults }]);
    showToast(`${defaults.label} added — drag it into place`);
  };

  const savePlan = async () => {
    try {
      const response = await fetch("/api/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: items }),
      });
      if (!response.ok) throw new Error("Save failed");
      showToast("Garden plan saved");
    } catch {
      showToast("Your layout is ready — cloud saving will start after setup");
    }
  };

  const moveItem = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left - drag.current.offsetX) / rect.width) * 100;
    const y = ((event.clientY - rect.top - drag.current.offsetY) / rect.height) * 100;
    setItems((current) => current.map((item) => item.id === drag.current?.id
      ? { ...item, x: Math.max(0, Math.min(100 - item.w, x)), y: Math.max(0, Math.min(100 - item.h, y)) }
      : item));
  };

  const remainingTasks = useMemo(() => tasks.filter((task) => !task.done).length, [tasks]);

  return (
    <main className="app-shell">
      <div className="paper-noise" />
      <div className="app-frame">
        <header className="topbar">
          <button className="brand" onClick={() => setTab("today")} aria-label="Go to today">
            <span className="brand-mark">P</span>
            <span><b>Plot &amp; Petal</b><small>Garden journal</small></span>
          </button>
          <button className="weather" aria-label="Local weather"><span>☀</span><b>21°</b><small>Dry today</small></button>
        </header>

        {tab === "today" && (
          <section className="screen today-screen">
            <div className="date-line">Wednesday · 5 August</div>
            <h1>Good morning,<br /><em>gardener.</em></h1>
            <p className="intro">Your plot is looking happy. There are <b>{remainingTasks} small things</b> to keep it that way.</p>

            <article className="hero-task">
              <div className="hero-task-top"><span className="eyebrow light">Up next · before 10am</span><button onClick={() => toggleTask(1)}>Mark done</button></div>
              <div className="hero-task-body"><span className="water-drop">💧</span><div><h2>Water the French beans</h2><p>The sunny bed has been dry for two days. Give the roots a slow, deep drink.</p></div></div>
              <div className="task-meta"><span>◷ 2 minutes</span><span>⌖ Back bed</span></div>
            </article>

            <button className="quick-note" onClick={() => setTab("journal")}>
              <span className="quick-plus">+</span>
              <span><b>What happened in the garden?</b><small>Planting, pruning, an idea, or an observation…</small></span>
              <i>→</i>
            </button>

            <div className="section-title"><div><span className="eyebrow">Coming up</span><h2>Your garden rhythm</h2></div><button onClick={() => setTab("journal")}>See journal</button></div>
            <div className="task-list">
              {tasks.slice(0, 3).map((task) => (
                <button key={task.id} className={`task-row ${task.done ? "done" : ""}`} onClick={() => toggleTask(task.id)}>
                  <span className="task-date">{task.day}</span><span className="task-icon">{task.emoji}</span>
                  <span className="task-copy"><b>{task.title}</b><small>{task.detail}</small></span><span className="check">✓</span>
                </button>
              ))}
            </div>

            <aside className="notify-card">
              <div><span className="eyebrow">Gentle nudges</span><h3>Never miss a watering day</h3><p>Turn on reminders and we’ll only notify you when something needs attention.</p></div>
              <button onClick={enableNotifications}>Turn on</button>
            </aside>
          </section>
        )}

        {tab === "journal" && (
          <section className="screen journal-screen">
            <div className="page-heading"><span className="eyebrow">Garden journal</span><h1>Capture what’s<br /><em>growing on.</em></h1><p>Write naturally. We’ll recognise the plant and turn your note into useful care.</p></div>
            <div className="journal-composer">
              <div className="composer-top"><span>Today · 9:42 am</span><span className="ink-dot" /></div>
              <textarea value={journal} onChange={(event) => { setJournal(event.target.value); setRecognized(null); }} placeholder="I planted French beans in the sunny bed today…" aria-label="New garden journal entry" />
              <div className="suggestion-chips"><button onClick={() => setJournal("I planted French beans in the sunny back bed today.")}>+ planted</button><button onClick={() => setJournal("The tomato leaves have brown spots today.")}>+ spotted an issue</button><button onClick={() => setJournal("I watered the lavender this morning.")}>+ watered</button></div>
              <button className="primary-button" onClick={recognized ? saveEntry : analyseEntry} disabled={!journal.trim()}>{recognized ? "Save & create reminders" : "Understand my note"}<span>→</span></button>
            </div>

            {recognized && <PlantAdvice plant={recognized} />}

            <div className="section-title journal-history"><div><span className="eyebrow">Recent notes</span><h2>From your garden</h2></div></div>
            <div className="entry-list">
              {savedEntries.map((entry, index) => (
                <article className="entry-card" key={`${entry.date}-${index}`}>
                  <div className="entry-date"><span>{entry.date}</span><i /></div>
                  <div><div className="entry-plant"><span>{entry.plant.emoji}</span>{entry.plant.name}</div><p>{entry.text}</p></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "plan" && (
          <section className="screen plan-screen">
            <div className="page-heading plan-heading"><span className="eyebrow">My plot</span><h1>Shape your<br /><em>garden.</em></h1><p>Tap to add something, then drag it exactly where it grows.</p></div>
            <div className="palette" aria-label="Garden item palette">
              <button onClick={() => addItem("bed")}><span className="palette-bed" />Bed</button>
              <button onClick={() => addItem("plant")}><span>🌱</span>Plant</button>
              <button onClick={() => addItem("water")}><span>💧</span>Water</button>
              <button onClick={() => addItem("seat")}><span className="palette-seat">═</span>Seat</button>
            </div>
            <div className="garden-canvas" onPointerMove={moveItem} onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }}>
              <div className="sun-path"><span>Morning sun</span><i>☀</i></div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`garden-item ${item.kind}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%` }}
                  onPointerDown={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    drag.current = { id: item.id, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  aria-label={`Move ${item.label}`}
                >
                  {item.emoji && <span>{item.emoji}</span>}<small>{item.label}</small>
                  {item.kind === "bed" && <i className="bed-lines" />}
                </button>
              ))}
              <span className="north">N ↑</span>
            </div>
            <div className="canvas-footer"><span><b>12 m²</b><small>Garden area</small></span><span><b>6 h</b><small>Summer sun</small></span><button onClick={savePlan}>Save plan</button></div>
            <div className="plot-tip"><span>✦</span><p><b>A sunny choice</b>Your beans are in the brightest part of the plot. Keep taller supports north of smaller plants to avoid casting shade.</p></div>
          </section>
        )}

        {tab === "plants" && (
          <section className="screen plants-screen">
            <div className="page-heading"><span className="eyebrow">Plant library</span><h1>Know what your<br /><em>plants need.</em></h1><p>A growing guide to what’s in your garden and what you might plant next.</p></div>
            <label className="plant-search"><span>⌕</span><input placeholder="Search beans, tomatoes, lavender…" aria-label="Search plants" /></label>
            <div className="your-plants"><span className="eyebrow">In your garden · 4</span>
              {profiles.map((plant) => <PlantAdvice key={plant.key} plant={plant} compact />)}
            </div>
            <button className="primary-button add-plant" onClick={() => { setTab("journal"); showToast("Mention the plant in a journal note to add it"); }}>+ Add a plant</button>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span><small>{item.label}</small>{item.id === "today" && remainingTasks > 0 && <i>{remainingTasks}</i>}
            </button>
          ))}
        </nav>
        {toast && <div className="toast"><span>✓</span>{toast}</div>}
      </div>
    </main>
  );
}
