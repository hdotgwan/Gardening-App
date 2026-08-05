"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

type Tab = "today" | "journal" | "plan" | "plants";
type Orientation = "N" | "E" | "S" | "W";

type Plant = {
  key: string;
  name: string;
  scientific: string;
  emoji: string;
  sun: string;
  water: string;
  soil: string;
  heightM: number | null;
  spacing: string;
  harvestDays?: number;
  issue: string;
  tip: string;
  external?: boolean;
};

type Task = { id: number; due: string; title: string; detail: string; emoji: string; done: boolean };
type Entry = { id: number; date: string; text: string; plant: Plant | null };

type GardenItem = {
  id: number;
  kind: "bed" | "plant" | "tree" | "water" | "seat" | "path";
  label: string;
  emoji: string;
  x: number;
  y: number;
  widthM: number;
  lengthM: number;
  heightM: number;
  shape: "rectangle" | "rounded" | "circle";
};

type Weather = { temperature: number; code: number; rain: number };

const builtInPlants: Plant[] = [
  { key: "french-bean", name: "French bean", scientific: "Phaseolus vulgaris", emoji: "🫛", sun: "Full sun", water: "Evenly moist", soil: "Fertile, free-draining", heightM: 2, spacing: "15 cm", harvestDays: 70, issue: "Slugs, aphids and waterlogged roots", tip: "Add supports before climbing varieties begin to twine." },
  { key: "tomato", name: "Tomato", scientific: "Solanum lycopersicum", emoji: "🍅", sun: "Full sun", water: "Deep and consistent", soil: "Rich, free-draining", heightM: 1.8, spacing: "45–60 cm", harvestDays: 90, issue: "Blight, blossom-end rot and split fruit", tip: "Water at soil level and feed once fruit begins to set." },
  { key: "lavender", name: "English lavender", scientific: "Lavandula angustifolia", emoji: "🪻", sun: "Full sun", water: "Low", soil: "Very free-draining", heightM: 0.6, spacing: "45 cm", issue: "Root rot in winter-wet soil", tip: "Trim after flowering without cutting into old wood." },
  { key: "lettuce", name: "Leaf lettuce", scientific: "Lactuca sativa", emoji: "🥬", sun: "Sun or light shade", water: "Little and often", soil: "Moist, fertile", heightM: 0.3, spacing: "20–30 cm", harvestDays: 50, issue: "Slugs, bolting and downy mildew", tip: "Sow a short row every fortnight for a steady harvest." },
  { key: "rose", name: "Rose", scientific: "Rosa", emoji: "🌹", sun: "Full sun", water: "Deep weekly watering", soil: "Rich, moisture-retentive", heightM: 1.5, spacing: "60–90 cm", issue: "Black spot, rust, mildew and aphids", tip: "Give it moving air and clear fallen leaves in autumn." },
  { key: "hydrangea", name: "Hydrangea", scientific: "Hydrangea macrophylla", emoji: "🌸", sun: "Part shade", water: "Moist, never waterlogged", soil: "Humus-rich", heightM: 1.5, spacing: "1–1.5 m", issue: "Powdery mildew and leaf spot", tip: "Morning sun with afternoon shade helps prevent wilting." },
  { key: "hosta", name: "Hosta", scientific: "Hosta", emoji: "🌿", sun: "Part to full shade", water: "Consistently moist", soil: "Rich, moisture-retentive", heightM: 0.6, spacing: "45–90 cm", issue: "Slugs and snails", tip: "Water early in the day and protect new shoots from molluscs." },
  { key: "sunflower", name: "Sunflower", scientific: "Helianthus annuus", emoji: "🌻", sun: "Full sun", water: "Regular deep watering", soil: "Free-draining", heightM: 2.4, spacing: "30–45 cm", harvestDays: 100, issue: "Slugs, wind damage and mildew", tip: "Stake tall varieties before they become top-heavy." },
  { key: "courgette", name: "Courgette", scientific: "Cucurbita pepo", emoji: "🥒", sun: "Full sun", water: "Plentiful and regular", soil: "Rich, moisture-retentive", heightM: 0.6, spacing: "90 cm", harvestDays: 60, issue: "Powdery mildew and blossom-end rot", tip: "Water the soil rather than leaves and pick fruits young." },
  { key: "strawberry", name: "Strawberry", scientific: "Fragaria × ananassa", emoji: "🍓", sun: "Full sun", water: "Regular while fruiting", soil: "Fertile, free-draining", heightM: 0.25, spacing: "35 cm", harvestDays: 90, issue: "Grey mould, vine weevil and slugs", tip: "Keep fruit off damp soil with straw or a mat." },
  { key: "basil", name: "Basil", scientific: "Ocimum basilicum", emoji: "🌱", sun: "Warm, sheltered sun", water: "Moist, not saturated", soil: "Free-draining", heightM: 0.45, spacing: "20 cm", harvestDays: 60, issue: "Aphids, mildew and cold damage", tip: "Pinch out tips regularly to keep plants bushy." },
  { key: "mint", name: "Mint", scientific: "Mentha", emoji: "🌿", sun: "Sun or part shade", water: "Moist", soil: "Moist, fertile", heightM: 0.6, spacing: "45 cm", issue: "Rust and aggressive spreading", tip: "Grow in a submerged pot to keep the roots contained." },
  { key: "rosemary", name: "Rosemary", scientific: "Salvia rosmarinus", emoji: "🌿", sun: "Full sun", water: "Low once established", soil: "Free-draining", heightM: 1.2, spacing: "60 cm", issue: "Root rot and rosemary beetle", tip: "Avoid wet feet, especially through winter." },
  { key: "thyme", name: "Thyme", scientific: "Thymus vulgaris", emoji: "🌿", sun: "Full sun", water: "Low", soil: "Gritty, free-draining", heightM: 0.3, spacing: "25 cm", issue: "Root rot in heavy soil", tip: "Trim lightly after flowering to keep a compact shape." },
  { key: "sage", name: "Garden sage", scientific: "Salvia officinalis", emoji: "🌿", sun: "Full sun", water: "Moderate to low", soil: "Free-draining", heightM: 0.75, spacing: "45 cm", issue: "Powdery mildew and root rot", tip: "Replace woody plants every few years for tender growth." },
  { key: "pea", name: "Garden pea", scientific: "Pisum sativum", emoji: "🫛", sun: "Sun or light shade", water: "Regular while flowering", soil: "Fertile, free-draining", heightM: 1.8, spacing: "8 cm", harvestDays: 75, issue: "Pea moth, pigeons and mildew", tip: "Provide supports when sowing and pick pods frequently." },
  { key: "carrot", name: "Carrot", scientific: "Daucus carota", emoji: "🥕", sun: "Full sun", water: "Even moisture", soil: "Deep, stone-free", heightM: 0.35, spacing: "5–8 cm", harvestDays: 80, issue: "Carrot fly and forked roots", tip: "Avoid freshly manured soil and thin seedlings carefully." },
  { key: "potato", name: "Potato", scientific: "Solanum tuberosum", emoji: "🥔", sun: "Full sun", water: "Regular from tuber set", soil: "Loose, fertile", heightM: 0.8, spacing: "30–40 cm", harvestDays: 100, issue: "Blight, scab and slugs", tip: "Earth up stems as they grow to protect developing tubers." },
  { key: "onion", name: "Onion", scientific: "Allium cepa", emoji: "🧅", sun: "Full sun", water: "Moderate", soil: "Firm, free-draining", heightM: 0.45, spacing: "10 cm", harvestDays: 120, issue: "Onion fly, rust and white rot", tip: "Stop watering once leaves begin to yellow and fall." },
  { key: "garlic", name: "Garlic", scientific: "Allium sativum", emoji: "🧄", sun: "Full sun", water: "Moderate in spring", soil: "Free-draining", heightM: 0.6, spacing: "15 cm", harvestDays: 240, issue: "Rust and white rot", tip: "Plant individual cloves point-up and avoid waterlogged ground." },
  { key: "foxglove", name: "Foxglove", scientific: "Digitalis purpurea", emoji: "🌺", sun: "Part shade", water: "Moderate", soil: "Moist, free-draining", heightM: 1.5, spacing: "45 cm", issue: "Leaf spot and powdery mildew; toxic if eaten", tip: "Let a few flower spikes seed for plants the following year." },
  { key: "echinacea", name: "Echinacea", scientific: "Echinacea purpurea", emoji: "🌸", sun: "Full sun", water: "Moderate", soil: "Free-draining", heightM: 1.1, spacing: "45 cm", issue: "Leaf spot and vine weevil", tip: "Leave seed heads standing in winter for birds." },
  { key: "dahlia", name: "Dahlia", scientific: "Dahlia", emoji: "🌺", sun: "Full sun", water: "Regular", soil: "Rich, free-draining", heightM: 1.2, spacing: "60 cm", issue: "Slugs, earwigs and powdery mildew", tip: "Deadhead often and protect tubers from hard frost." },
  { key: "apple", name: "Apple tree", scientific: "Malus domestica", emoji: "🍎", sun: "Full sun", water: "Deeply in dry spells", soil: "Fertile, free-draining", heightM: 3.5, spacing: "3–5 m", issue: "Apple scab, codling moth and canker", tip: "Check pollination partners before choosing a variety." },
];

const nav: { id: Tab; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "⌂" },
  { id: "journal", label: "Journal", icon: "✎" },
  { id: "plan", label: "My plot", icon: "▦" },
  { id: "plants", label: "Plants", icon: "♧" },
];

const PLOT_WIDTH = 6;
const PLOT_LENGTH = 8;

function weatherLabel(code: number) {
  if (code === 0) return { icon: "☀", text: "Clear" };
  if (code <= 3) return { icon: "⛅", text: "Cloudy" };
  if (code <= 67) return { icon: "🌧", text: "Rain" };
  if (code <= 77) return { icon: "❄", text: "Snow" };
  if (code <= 82) return { icon: "🌦", text: "Showers" };
  return { icon: "⛈", text: "Stormy" };
}

function relativeDay(days: number) {
  if (days === 1) return "Tomorrow";
  if (days === 7) return "In 1 week";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(Date.now() + days * 86400000));
}

function PlantCard({ plant, onAdd }: { plant: Plant; onAdd?: () => void }) {
  return (
    <article className="catalogue-card">
      <div className="catalogue-heading"><span>{plant.emoji}</span><div><h3>{plant.name}</h3><p>{plant.scientific}</p></div>{onAdd && <button onClick={onAdd}>Add</button>}</div>
      <div className="plant-facts">
        <span><small>Light</small><b>{plant.sun}</b></span>
        <span><small>Height</small><b>{plant.heightM ? `Up to ${plant.heightM} m` : "Not recorded"}</b></span>
        <span><small>Water</small><b>{plant.water}</b></span>
      </div>
      <p className="susceptibility"><b>Watch for</b>{plant.issue}</p>
    </article>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [journal, setJournal] = useState("");
  const [recognized, setRecognized] = useState<Plant | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [items, setItems] = useState<GardenItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("N");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [plantQuery, setPlantQuery] = useState("");
  const [plantResults, setPlantResults] = useState<Plant[]>(builtInPlants.slice(0, 8));
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [globalCatalogue, setGlobalCatalogue] = useState<boolean | null>(null);
  const drag = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const dateLabel = useMemo(() => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const remainingTasks = tasks.filter((task) => !task.done);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const loadWeather = async (latitude: number, longitude: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation&timezone=auto`);
      if (!response.ok) throw new Error("Weather unavailable");
      const data = await response.json() as { current: { temperature_2m: number; weather_code: number; precipitation: number } };
      setWeather({ temperature: Math.round(data.current.temperature_2m), code: data.current.weather_code, rain: data.current.precipitation });
    } catch {
      showToast("Couldn’t load local weather just now");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("plot-petal-location");
    if (stored) {
      const coords = JSON.parse(stored) as { latitude: number; longitude: number };
      void loadWeather(coords.latitude, coords.longitude);
    }
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) return showToast("Location isn’t available on this device");
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        window.localStorage.setItem("plot-petal-location", JSON.stringify(coords));
        void loadWeather(coords.latitude, coords.longitude);
      },
      () => { setWeatherLoading(false); showToast("Location wasn’t shared — weather remains off"); },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) return showToast("Notifications aren’t supported in this browser");
    const result = await Notification.requestPermission();
    showToast(result === "granted" ? "Reminder notifications are enabled" : "You can enable notifications later in device settings");
  };

  const detectLocalPlant = (text: string) => {
    const lower = text.toLowerCase();
    return builtInPlants.find((plant) => lower.includes(plant.name.toLowerCase()) || lower.includes(plant.scientific.toLowerCase()) || lower.includes(plant.key.replaceAll("-", " "))) ?? null;
  };

  const searchGlobalPlants = async (query: string) => {
    const local = builtInPlants.filter((plant) => `${plant.name} ${plant.scientific}`.toLowerCase().includes(query.toLowerCase()));
    if (!query.trim()) { setPlantResults(builtInPlants.slice(0, 8)); return builtInPlants.slice(0, 8); }
    setCatalogueLoading(true);
    try {
      const response = await fetch(`/api/plants?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { plants?: Plant[]; configured?: boolean };
      setGlobalCatalogue(Boolean(data.configured));
      const merged = [...local, ...(data.plants ?? [])].filter((plant, index, all) => all.findIndex((candidate) => candidate.key === plant.key) === index).slice(0, 12);
      setPlantResults(merged);
      return merged;
    } catch {
      setPlantResults(local);
      return local;
    } finally {
      setCatalogueLoading(false);
    }
  };

  const analyseEntry = async () => {
    let plant = detectLocalPlant(journal);
    if (!plant) {
      const candidates = journal.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !["planted", "planting", "watered", "today", "garden", "noticed", "leaves", "seeded", "sowed"].includes(word));
      for (const candidate of candidates.slice(0, 4)) {
        const results = await searchGlobalPlants(candidate);
        const exact = results.find((result) => result.name.toLowerCase() === candidate || result.scientific.toLowerCase().includes(candidate));
        if (exact) { plant = exact; break; }
      }
    }
    setRecognized(plant);
    if (!plant) showToast("I couldn’t identify the plant — try its common or botanical name");
  };

  const tasksFromEntry = (text: string, plant: Plant | null): Task[] => {
    const lower = text.toLowerCase();
    const name = plant?.name ?? "this planting";
    const created: Task[] = [];
    if (/plant|sow|seed|transplant/.test(lower)) {
      created.push({ id: Date.now(), due: relativeDay(1), title: `Check soil around ${name.toLowerCase()}`, detail: "Water only if the top layer feels dry", emoji: "💧", done: false });
      created.push({ id: Date.now() + 1, due: relativeDay(7), title: `Check ${name.toLowerCase()} progress`, detail: plant?.tip ?? "Look for healthy new growth", emoji: plant?.emoji ?? "🌱", done: false });
      if (plant?.harvestDays) created.push({ id: Date.now() + 2, due: relativeDay(plant.harvestDays), title: `${plant.name} may be ready to harvest`, detail: "Check maturity before picking", emoji: "🧺", done: false });
    } else if (/water/.test(lower)) {
      created.push({ id: Date.now(), due: relativeDay(3), title: `Check moisture for ${name.toLowerCase()}`, detail: "Weather and soil may change the timing", emoji: "💧", done: false });
    } else if (/mildew|spot|yellow|pest|aphid|slug|problem|issue|damage/.test(lower)) {
      created.push({ id: Date.now(), due: relativeDay(1), title: `Recheck ${name.toLowerCase()}`, detail: plant?.issue ?? "Compare the affected area and take a photo", emoji: "🔎", done: false });
    } else if (/prun|cut back|trim/.test(lower)) {
      created.push({ id: Date.now(), due: relativeDay(7), title: `Check recovery of ${name.toLowerCase()}`, detail: "Look for healthy new growth", emoji: "✂️", done: false });
    }
    return created;
  };

  const saveEntry = async () => {
    if (!journal.trim()) return;
    const plant = recognized ?? detectLocalPlant(journal);
    const newTasks = tasksFromEntry(journal, plant);
    setEntries((current) => [{ id: Date.now(), date: "Today", text: journal.trim(), plant }, ...current]);
    setTasks((current) => [...newTasks, ...current]);
    try {
      await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: journal.trim(), plantKey: plant?.key ?? null }) });
    } catch { /* stays available in the current session */ }
    setJournal(""); setRecognized(null);
    showToast(newTasks.length ? `Note saved · ${newTasks.length} reminder${newTasks.length === 1 ? "" : "s"} added` : "Note saved · no action needed");
  };

  const addItem = (kind: GardenItem["kind"]) => {
    const defaults: Record<GardenItem["kind"], Omit<GardenItem, "id" | "kind" | "x" | "y">> = {
      bed: { label: "New bed", emoji: "", widthM: 2.4, lengthM: 1.2, heightM: 0.2, shape: "rectangle" },
      plant: { label: "New plant", emoji: "🌱", widthM: 0.7, lengthM: 0.7, heightM: 0.5, shape: "circle" },
      tree: { label: "New tree", emoji: "🌳", widthM: 1.2, lengthM: 1.2, heightM: 3, shape: "circle" },
      water: { label: "Water feature", emoji: "💧", widthM: 1.5, lengthM: 1.2, heightM: 0, shape: "rounded" },
      seat: { label: "Seat", emoji: "", widthM: 1.5, lengthM: 0.5, heightM: 0.8, shape: "rectangle" },
      path: { label: "Path", emoji: "", widthM: 1, lengthM: 3, heightM: 0, shape: "rounded" },
    };
    const item = { id: Date.now(), kind, x: 36, y: 36, ...defaults[kind] };
    setItems((current) => [...current, item]); setSelectedId(item.id);
  };

  const updateSelected = (patch: Partial<GardenItem>) => {
    if (!selectedId) return;
    setItems((current) => current.map((item) => item.id === selectedId ? { ...item, ...patch } : item));
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: Date.now(), label: `${selected.label} copy`, x: Math.min(82, selected.x + 5), y: Math.min(82, selected.y + 5) };
    setItems((current) => [...current, copy]); setSelectedId(copy.id);
  };

  const moveItem = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const item = items.find((candidate) => candidate.id === drag.current?.id);
    if (!item) return;
    const widthPct = item.widthM / PLOT_WIDTH * 100;
    const lengthPct = item.lengthM / PLOT_LENGTH * 100;
    const x = (event.clientX - rect.left - drag.current.offsetX) / rect.width * 100;
    const y = (event.clientY - rect.top - drag.current.offsetY) / rect.height * 100;
    setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, x: Math.max(0, Math.min(100 - widthPct, x)), y: Math.max(0, Math.min(100 - lengthPct, y)) } : candidate));
  };

  const plotAdvice = useMemo(() => {
    if (!items.length) return { title: "Start with what’s already there", body: "Add the beds, paths and features you have now. Advice will update as the layout changes." };
    const plants = items.filter((item) => item.kind === "plant" || item.kind === "tree");
    if (!plants.length) return { title: "Ready for planting", body: `Your ${orientation}-up plan has space mapped. Add plants or trees to check height and shade relationships.` };
    const northScore = (item: GardenItem) => {
      const cx = item.x + item.widthM / PLOT_WIDTH * 50;
      const cy = item.y + item.lengthM / PLOT_LENGTH * 50;
      return orientation === "N" ? -cy : orientation === "S" ? cy : orientation === "E" ? cx : -cx;
    };
    const tall = plants.filter((item) => item.heightM >= 1.5);
    const short = plants.filter((item) => item.heightM < 1.5);
    const shadeRisk = tall.find((high) => short.some((low) => northScore(high) < northScore(low)));
    if (shadeRisk) return { title: "Possible shade overlap", body: `${shadeRisk.label} is on the sunnier side of a shorter planting and may cast shade northwards. Drag it or change the orientation to compare.` };
    const crowded = plants.find((plant) => plants.some((other) => other.id !== plant.id && Math.hypot(plant.x - other.x, plant.y - other.y) < 10));
    if (crowded) return { title: "Check your spacing", body: `${crowded.label} is close to another plant. Use the dimensions panel to leave enough mature spread and moving air.` };
    return { title: "A balanced arrangement", body: `With ${orientation} at the top, taller plants sit away from the likely northward shade path. Advice will keep updating as you move things.` };
  }, [items, orientation]);

  const savePlan = async () => {
    try {
      const response = await fetch("/api/plan", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ elements: items }) });
      if (!response.ok) throw new Error();
      showToast("Garden plan saved");
    } catch { showToast("Couldn’t save the plan just now"); }
  };

  const weatherDisplay = weather ? weatherLabel(weather.code) : null;

  return (
    <main className="app-shell"><div className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("today")}><span className="brand-mark">P</span><span><b>Plot &amp; Petal</b><small>Garden journal</small></span></button>
        <button className={`weather ${weather ? "live" : ""}`} onClick={requestLocation} aria-label="Use my location for live weather">
          <span>{weatherLoading ? "…" : weatherDisplay?.icon ?? "⌖"}</span>
          <b>{weather ? `${weather.temperature}°` : "Weather"}</b>
          <small>{weatherDisplay?.text ?? "Set location"}</small>
        </button>
      </header>

      {tab === "today" && <section className="screen today-screen">
        <div className="date-line">{dateLabel}</div>
        <h1>Your garden,<br /><em>today.</em></h1>
        <p className="intro">{remainingTasks.length ? `You have ${remainingTasks.length} ${remainingTasks.length === 1 ? "thing" : "things"} coming up.` : "Nothing is waiting for you yet. Your journal will shape this page."}</p>
        {remainingTasks.length ? <article className="hero-task">
          <div className="hero-task-top"><span className="eyebrow light">Up next · {remainingTasks[0].due}</span><button onClick={() => setTasks((current) => current.map((task) => task.id === remainingTasks[0].id ? { ...task, done: true } : task))}>Mark done</button></div>
          <div className="hero-task-body"><span className="water-drop">{remainingTasks[0].emoji}</span><div><h2>{remainingTasks[0].title}</h2><p>{remainingTasks[0].detail}</p></div></div>
          {weather && <div className="task-meta"><span>{weather.rain > 0 ? "Rain is falling — check before watering" : `${weather.temperature}° locally right now`}</span></div>}
        </article> : <article className="empty-today"><span>✎</span><h2>Begin with a note</h2><p>Record something you planted, watered, pruned or noticed. Relevant jobs will appear here automatically.</p><button onClick={() => setTab("journal")}>Write your first note →</button></article>}

        <button className="quick-note" onClick={() => setTab("journal")}><span className="quick-plus">+</span><span><b>What happened in the garden?</b><small>Planting, pruning, an idea, or an observation…</small></span><i>→</i></button>
        {tasks.length > 0 && <><div className="section-title"><div><span className="eyebrow">Your reminders</span><h2>Garden rhythm</h2></div></div><div className="task-list">{tasks.map((task) => <button key={task.id} className={`task-row ${task.done ? "done" : ""}`} onClick={() => setTasks((current) => current.map((candidate) => candidate.id === task.id ? { ...candidate, done: !candidate.done } : candidate))}><span className="task-date">{task.due}</span><span className="task-icon">{task.emoji}</span><span className="task-copy"><b>{task.title}</b><small>{task.detail}</small></span><span className="check">✓</span></button>)}</div></>}
        <aside className="weather-card"><div><span className="eyebrow">Local conditions</span><h3>{weather ? `${weather.temperature}° · ${weatherDisplay?.text}` : "Weather is off"}</h3><p>{weather ? <>Based on your device location and the latest local forecast. <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo.</a></> : "Tap the weather button above and choose Allow. Coordinates are saved on this device and sent to Open-Meteo for the forecast."}</p></div>{!weather && <button onClick={requestLocation}>Set location</button>}</aside>
        {tasks.length > 0 && <aside className="notify-card"><div><span className="eyebrow">Gentle nudges</span><h3>Get reminder alerts</h3><p>Allow notifications so the app can alert you while it is open or installed.</p></div><button onClick={enableNotifications}>Turn on</button></aside>}
      </section>}

      {tab === "journal" && <section className="screen journal-screen">
        <div className="page-heading"><span className="eyebrow">Garden journal</span><h1>Capture what’s<br /><em>growing on.</em></h1><p>Write naturally. Planting, watering, pruning and problems can become useful reminders.</p></div>
        <div className="journal-composer"><div className="composer-top"><span>New note · {dateLabel}</span><span className="ink-dot" /></div><textarea value={journal} onChange={(event) => { setJournal(event.target.value); setRecognized(null); }} placeholder="I planted echinacea beside the back fence today…" />
          <div className="suggestion-chips"><button onClick={() => setJournal("I planted tomatoes today.")}>+ planted</button><button onClick={() => setJournal("I noticed mildew on the courgette leaves.")}>+ spotted an issue</button><button onClick={() => setJournal("I watered the hydrangea this morning.")}>+ watered</button></div>
          <button className="primary-button" onClick={recognized ? saveEntry : analyseEntry} disabled={!journal.trim()}>{recognized ? "Save note & create reminders" : "Understand my note"}<span>→</span></button>
        </div>
        {recognized && <div className="recognition-wrap"><span className="eyebrow">Plant recognised</span><PlantCard plant={recognized} /></div>}
        <div className="section-title journal-history"><div><span className="eyebrow">Your history</span><h2>{entries.length ? "From your garden" : "No entries yet"}</h2></div></div>
        {entries.length ? <div className="entry-list">{entries.map((entry) => <article className="entry-card" key={entry.id}><div className="entry-date"><span>{entry.date}</span><i /></div><div><div className="entry-plant"><span>{entry.plant?.emoji ?? "✎"}</span>{entry.plant?.name ?? "Garden note"}</div><p>{entry.text}</p></div></article>)}</div> : <p className="empty-copy">Your journal starts blank—no demo plants and no assumed jobs.</p>}
      </section>}

      {tab === "plan" && <section className="screen plan-screen">
        <div className="page-heading plan-heading"><span className="eyebrow">My plot · {PLOT_WIDTH} × {PLOT_LENGTH} m</span><h1>Shape your<br /><em>garden.</em></h1><p>Add as many features as you need. Select anything to name, size, reshape, copy or remove it.</p></div>
        <div className="orientation-row"><span>Top of plan faces</span>{(["N", "E", "S", "W"] as Orientation[]).map((direction) => <button key={direction} className={orientation === direction ? "active" : ""} onClick={() => setOrientation(direction)}>{direction}</button>)}</div>
        <div className="palette expanded"><button onClick={() => addItem("bed")}><span className="palette-bed" />+ Bed</button><button onClick={() => addItem("plant")}><span>🌱</span>+ Plant</button><button onClick={() => addItem("tree")}><span>🌳</span>+ Tree</button><button onClick={() => addItem("water")}><span>💧</span>+ Water</button><button onClick={() => addItem("path")}><span className="palette-path" />+ Path</button><button onClick={() => addItem("seat")}><span className="palette-seat">═</span>+ Seat</button></div>
        {selected && <div className="object-inspector"><div className="inspector-top"><span className="eyebrow">Editing {selected.kind}</span><div><button onClick={duplicateSelected}>Duplicate</button><button className="danger" onClick={() => { setItems((current) => current.filter((item) => item.id !== selected.id)); setSelectedId(null); }}>Delete</button></div></div>
          <label className="wide-field">Name<input value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} /></label>
          <div className="measure-fields"><label>Width (m)<input type="number" min="0.2" max={PLOT_WIDTH} step="0.1" value={selected.widthM} onChange={(event) => updateSelected({ widthM: Math.max(.2, Number(event.target.value)) })} /></label><label>Length (m)<input type="number" min="0.2" max={PLOT_LENGTH} step="0.1" value={selected.lengthM} onChange={(event) => updateSelected({ lengthM: Math.max(.2, Number(event.target.value)) })} /></label>{(selected.kind === "plant" || selected.kind === "tree") && <label>Height (m)<input type="number" min="0.1" max="20" step="0.1" value={selected.heightM} onChange={(event) => updateSelected({ heightM: Math.max(.1, Number(event.target.value)) })} /></label>}</div>
          <div className="shape-row"><span>Shape</span>{(["rectangle", "rounded", "circle"] as GardenItem["shape"][]).map((shape) => <button key={shape} className={selected.shape === shape ? "active" : ""} onClick={() => updateSelected({ shape })}>{shape}</button>)}</div>
        </div>}
        <div className="garden-canvas measured" onPointerMove={moveItem} onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }} onClick={() => setSelectedId(null)}>
          {!items.length && <div className="canvas-empty"><span>+</span><b>Your plot is empty</b><small>Use the buttons above to add what’s really there.</small></div>}
          {items.map((item) => { const width = Math.min(100, item.widthM / PLOT_WIDTH * 100); const height = Math.min(100, item.lengthM / PLOT_LENGTH * 100); return <button key={item.id} className={`garden-item ${item.kind} shape-${item.shape} ${selectedId === item.id ? "selected" : ""}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${width}%`, height: `${height}%` }} onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); }} onPointerDown={(event) => { event.stopPropagation(); const rect = event.currentTarget.getBoundingClientRect(); drag.current = { id: item.id, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top }; event.currentTarget.setPointerCapture(event.pointerId); setSelectedId(item.id); }}><span>{item.emoji}</span><small>{item.label}</small><i>{item.widthM} × {item.lengthM} m</i></button>; })}
          <span className={`north north-${orientation.toLowerCase()}`}>{orientation} ↑</span><span className="scale-bar">1 metre</span>
        </div>
        <div className="canvas-footer"><span><b>{PLOT_WIDTH * PLOT_LENGTH} m²</b><small>Total plot</small></span><span><b>{items.length}</b><small>Features</small></span><button onClick={savePlan}>Save plan</button></div>
        <div className="plot-tip dynamic"><span>✦</span><p><b>{plotAdvice.title}</b>{plotAdvice.body}</p></div>
      </section>}

      {tab === "plants" && <section className="screen plants-screen">
        <div className="page-heading"><span className="eyebrow">Plant catalogue</span><h1>Know what your<br /><em>plants need.</em></h1><p>Search common or botanical names for light, height, water and known vulnerabilities.</p></div>
        <form className="plant-search" onSubmit={(event) => { event.preventDefault(); void searchGlobalPlants(plantQuery); }}><span>⌕</span><input value={plantQuery} onChange={(event) => setPlantQuery(event.target.value)} placeholder="Search tomatoes, hostas, Echinacea…" /><button>{catalogueLoading ? "Searching…" : "Search"}</button></form>
        <div className="catalogue-status"><span>{globalCatalogue ? "Global catalogue connected" : `${builtInPlants.length} detailed garden plants built in`}</span>{globalCatalogue === false && <small>Global search needs the optional free catalogue connection.</small>}</div>
        <div className="catalogue-list">{plantResults.map((plant) => <PlantCard key={plant.key} plant={plant} onAdd={() => { setItems((current) => [...current, { id: Date.now(), kind: plant.heightM && plant.heightM >= 2.5 ? "tree" : "plant", label: plant.name, emoji: plant.emoji, x: 36, y: 36, widthM: .7, lengthM: .7, heightM: plant.heightM ?? .6, shape: "circle" }]); showToast(`${plant.name} added to your plot`); }} />)}</div>
        {!catalogueLoading && !plantResults.length && <p className="empty-copy">No matches found. Try the botanical name or a broader term.</p>}
      </section>}

      <nav className="bottom-nav">{nav.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.icon}</span><small>{item.label}</small>{item.id === "today" && remainingTasks.length > 0 && <i>{remainingTasks.length}</i>}</button>)}</nav>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div></main>
  );
}
