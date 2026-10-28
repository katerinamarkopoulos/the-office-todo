import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  NotebookText,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import boss from "@/assets/boss.png";
import reminder from "@/assets/reminder.png";
import trophy from "@/assets/trophy.png";
import jimSideEye from "@/assets/jim-sideeye.png.asset.json";
import michaelYey from "@/assets/michael-yey.png.asset.json";
import dundermifflin from "@/assets/dundermifflin.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Todays Office – Weekly To-Do" },
      { name: "description", content: "Plan your week Dunder-style: tasks, Dundies, notes and daily wisdom." },
      { property: "og:title", content: "Todays Office – Weekly To-Do" },
      { property: "og:description", content: "Plan your week Dunder-style: tasks, Dundies, notes and daily wisdom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Task = { id: string; text: string; week: number; done: boolean };
type Note = { id: string; text: string; color: number };

const NOTE_STYLES = [
  "bg-note-gray text-foreground",
  "bg-note-navy text-note-navy-foreground",
  "bg-secondary text-secondary-foreground",
];

const QUOTES = [
  "You miss 100% of the shots you don't take. – Wayne Gretzky",
  "Sometimes I'll start a sentence and I don't even know where it's going.",
  "I'm not superstitious, but I am a little stitious.",
  "Would I rather be feared or loved? Easy. Both.",
  "I learned a while back that if I do not text 911, people do not return my calls.",
  "I am Beyoncé, always.",
  "Fool me once, strike one. Fool me twice, strike three.",
];

function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7);
}

const uid = () => Math.random().toString(36).slice(2, 10);

function usePersisted<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setVal(JSON.parse(raw));
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, ready]);
  return [val, setVal] as const;
}

function Index() {
  const current = isoWeek(new Date());
  const [week, setWeek] = useState(current);
  const [tasks, setTasks] = usePersisted<Task[]>("office-tasks", [
    { id: "1", text: "Presentation med Micheal", week: current, done: false },
    { id: "2", text: "Möte med Jim", week: current, done: false },
    { id: "3", text: "Maila Dwight", week: current, done: false },
    { id: "4", text: "Ringa Pam", week: current, done: false },
    { id: "5", text: "Ringa Angela", week: current, done: true },
    { id: "6", text: "Maila Jim", week: current, done: true },
    { id: "7", text: "Möte med Jim", week: current - 1, done: false },
    { id: "8", text: "Boka konferensrum", week: current - 1, done: false },
  ]);
  const [notes, setNotes] = usePersisted<Note[]>("office-notes", [
    { id: "n1", text: "Remember to buy Milk for Coffe", color: 0 },
    { id: "n2", text: "Bake cake for Pam's Birthday party at the office", color: 1 },
    { id: "n3", text: "Do Michaels Marketing campaign for Dunkin Muffin", color: 2 },
    { id: "n4", text: "Set Dwights stuff in jelly", color: 0 },
  ]);
  const [name] = useState("Taouba");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [sideOpen, setSideOpen] = useState(false);

  const weekTasks = tasks.filter((t) => t.week === week);
  const todo = weekTasks.filter((t) => !t.done);
  const done = weekTasks.filter((t) => t.done);
  const lastWeek = tasks.filter((t) => t.week === week - 1 && !t.done);
  const pct = weekTasks.length ? (done.length / weekTasks.length) * 100 : 0;

  const toggle = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = () => {
    if (!draft.trim()) return;
    setTasks((ts) => [...ts, { id: uid(), text: draft.trim(), week, done: false }]);
    setDraft("");
    setAdding(false);
  };
  const addNote = () => {
    const text = window.prompt("New note");
    if (text?.trim()) setNotes((n) => [...n, { id: uid(), text: text.trim(), color: n.length % 3 }]);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="flex items-center justify-between bg-secondary px-6 py-3 md:px-40">
        <div className="flex items-center gap-8">
          <img src={boss} alt="Boss" width={816} height={816} className="h-20 w-20 object-cover object-top" />
          <h1 className="text-3xl">Todays Office</h1>
        </div>
        <div className="rounded-xl bg-background p-1.5 shadow">
          <div className="rounded-lg bg-foreground px-2 py-1 text-xs leading-tight text-background">
            The
            <br />
            <span className="text-sm">Office</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <div className="relative flex flex-col items-start gap-3 pt-4 md:flex-row md:items-center">
          <h2 className="text-3xl">Hello {name}!</h2>
          <div className="flex items-center gap-6 bg-secondary px-3 py-3 md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2">
            <button aria-label="Previous week" onClick={() => setWeek((w) => w - 1)}>
              <ChevronLeft />
            </button>
            <span className="flex items-center gap-2 text-2xl">
              Week {week} <CalendarDays className="h-5 w-5" />
            </span>
            <button aria-label="Next week" onClick={() => setWeek((w) => w + 1)}>
              <ChevronRight />
            </button>
          </div>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex flex-col bg-card p-6">
            <h3 className="mb-6 text-center text-3xl">To Do This Week</h3>
            <div className="flex-1 space-y-3">
              {todo.length === 0 ? (
                <div className="flex items-center justify-center gap-3 py-6">
                  <img
                    src={michaelYey.url}
                    alt="Michael Scott pointing finger guns in celebration"
                    width={500}
                    height={411}
                    className="h-20 w-24 shrink-0 object-contain"
                  />
                  <span className="text-xl">You're all set!</span>
                </div>
              ) : (
                todo.map((t) => <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} />)
              )}
              {adding && (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                    placeholder="New task…"
                    className="flex-1 border border-input bg-muted px-3 py-1 text-lg outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button onClick={() => setAdding(false)} aria-label="Cancel">
                    <X />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => (adding ? add() : setAdding(true))}
              className="mx-auto mt-6 flex w-56 flex-col items-center rounded-2xl bg-primary py-1.5 text-sm text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              {adding ? "Save" : "Add new"}
            </button>
          </div>

          <div className="flex flex-col bg-card p-6">
            <h3 className="mb-6 text-center text-3xl">Completed</h3>
            <div className="flex-1 space-y-1">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} />
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4 px-6">
              <img src={trophy} alt="Dundie" width={816} height={816} loading="lazy" className="h-14 w-10 object-contain" />
              <div className="flex-1">
                <p className="text-2xl">
                  {done.length}/{weekTasks.length} Dundies
                </p>
                <div className="mt-1 h-5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-6 pt-12">
            <div className="bg-card p-6">
              <button className="flex w-full items-center gap-6 text-left" onClick={() => setSideOpen((o) => !o)}>
                <img
                  src={jimSideEye.url}
                  alt="Jim giving a side-eye look at the camera"
                  width={353}
                  height={353}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 object-cover object-top"
                />
                <div className="flex-1">
                  <p className="text-3xl font-bold">Jims Side-Eye</p>
                  <p className="text-lg text-muted-foreground">{lastWeek.length} Tasks from last week</p>
                </div>
                {sideOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
              {sideOpen && (
                <div className="mt-4 space-y-3">
                  {lastWeek.length === 0 && <p className="text-muted-foreground">Nothing left behind. Nice.</p>}
                  {lastWeek.map((t) => (
                    <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} />
                  ))}
                </div>
              )}
            </div>

            <div className="min-h-36 bg-secondary p-4 text-secondary-foreground">
              <p className="flex items-center gap-4">
                <NotebookText className="h-5 w-5" /> Michaels daily wisdom
              </p>
              <p className="mt-3 text-lg">“{(QUOTES[Math.abs(week) % QUOTES.length] ?? "").split(" – ")[0]}”</p>
              <p className="mt-6 text-xs">– Michael Scott</p>
            </div>

            <div className="flex items-center gap-8 border-2 border-border bg-muted p-4">
              <img src={reminder} alt="" width={816} height={816} loading="lazy" className="h-16 w-16 object-cover object-top" />
              <div>
                <p className="text-2xl">Reminders</p>
                <p className="text-xl text-muted-foreground">Dont spill the coffee!!!</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-3xl">Notes</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {notes.map((n) => (
                <div key={n.id} className={`group relative aspect-[6/5] p-5 text-sm shadow-sm ${NOTE_STYLES[n.color]}`}>
                  {n.text}
                  <button
                    aria-label="Delete note"
                    onClick={() => setNotes((ns) => ns.filter((x) => x.id !== n.id))}
                    className="absolute bottom-2 right-2 opacity-0 transition group-hover:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addNote}
                className="flex aspect-[6/5] items-center justify-center bg-note-cream text-sm transition hover:brightness-95"
              >
                + Add New
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-3 bg-muted px-2 py-0.5">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 accent-primary"
        aria-label={task.text}
      />
      <span className="flex-1 text-xl">{task.text}</span>
      <button
        aria-label="Delete task"
        onClick={() => onRemove(task.id)}
        className="opacity-0 transition group-hover:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {task.done ? (
        <img
          src={michaelYey.url}
          alt=""
          aria-hidden
          width={500}
          height={411}
          loading="lazy"
          className="h-8 w-10 shrink-0 object-contain"
        />
      ) : (
        <img
          src={dundermifflin.url}
          alt=""
          aria-hidden
          width={480}
          height={358}
          loading="lazy"
          className="h-7 w-9 shrink-0 object-contain"
        />
      )}
    </div>
  );
}
