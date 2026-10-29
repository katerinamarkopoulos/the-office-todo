import type { ReactNode } from 'react';
import type { Task, Note, OfficeState } from '@/lib/office-data';
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  NotebookText,
  Pencil,
  Plus,
  Trash2,

  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import michaelFace from "@/assets/michael-face.png.asset.json";
import officeLogo from "@/assets/office-logo.png.asset.json";
import dwight from "@/assets/dwight.png.asset.json";
import trophy from "@/assets/trophy.png";
import jimSideEye from "@/assets/jim-sideeye.png.asset.json";
import michaelYey from "@/assets/michael-yey.png.asset.json";
import dundermifflin from "@/assets/dundermifflin.png.asset.json";

const NOTE_STYLES = [
  "bg-note-gray text-foreground",
  "bg-note-navy text-note-navy-foreground",
  "bg-secondary text-secondary-foreground",
];

const QUOTES = [
  "You miss 100% of the shots you don't take.",
  "I'm not superstitious, but I am a little stitious.",
  "I'm an early bird and I'm a night owl. So I'm wise and I have worms.",
  "Would I rather be feared or loved? Easy. Both.",
  "Do I need to be liked? Absolutely not.",
  "Guess what? I have flaws.",
  "And I knew exactly what to do. But in a much more real sense, I had no idea what to do.",
];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shiftDay = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const formatDay = (d: Date) =>
  `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;

const uid = () => Math.random().toString(36).slice(2, 10);

const sideEyeLine = (n: number) =>
  n === 0
    ? "“No tasks left from past weeks. Michael is happy!”"
    : `“${n} task${n === 1 ? "" : "s"} left from past weeks. Should we tell Michael?”`;



export function OfficeBoard({ initialState, onChange, account }: { initialState: OfficeState; onChange?: (state: OfficeState) => void; account?: ReactNode }) {
  const today = new Date();
  const current = dayKey(today);
  const [date, setDate] = useState(() => shiftDay(new Date(), 0));
  const [calOpen, setCalOpen] = useState(false);
  const day = dayKey(date);
  const prevDay = dayKey(shiftDay(date, -1));
  const taskDay = (t: Task) => t.day ?? current;
  const [tasks, setTasks] = useState<Task[]>(initialState.tasks);
  const [notes, setNotes] = useState<Note[]>(initialState.notes);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    onChange?.({ tasks, notes });
  }, [tasks, notes, onChange]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [focusNote, setFocusNote] = useState<string | null>(null);

  const weekTasks = tasks.filter((t) => taskDay(t) === day);
  const todo = weekTasks.filter((t) => !t.done);
  const done = weekTasks.filter((t) => t.done);
  const lastWeek = tasks.filter((t) => taskDay(t) === prevDay && !t.done);
  const pct = weekTasks.length ? (done.length / weekTasks.length) * 100 : 0;

  const toggle = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const edit = (id: string, text: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, text } : t)));

  const add = () => {
    if (!draft.trim()) return;
    setTasks((ts) => [...ts, { id: uid(), text: draft.trim(), day, done: false }]);
    setDraft("");
    setAdding(false);
  };
  const addNote = () => {
    const id = uid();
    setNotes((ns) => [...ns, { id, text: "", color: ns.length % 3 }]);
    setFocusNote(id);
  };
  const editNote = (id: string, text: string) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, text } : n)));
  const removeNote = (id: string) => setNotes((ns) => ns.filter((n) => n.id !== id));

  useEffect(() => {
    if (!focusNote) return;
    document.querySelector<HTMLTextAreaElement>(`textarea[data-note="${focusNote}"]`)?.focus();
    setFocusNote(null);
  }, [focusNote]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="flex items-center justify-between gap-2 bg-secondary px-4 py-4 md:px-6">
        <button
          onClick={() => setDate(shiftDay(new Date(), 0))}
          aria-label="Todays Office – go to today"
          title="Back to today"
          className="group flex cursor-pointer items-center gap-3 text-left md:gap-8"
        >
          <img src={michaelFace.url} alt="Michael Scott with a surprised look" width={500} height={353} className="h-14 w-20 shrink-0 object-contain transition group-hover:-rotate-3 group-active:-rotate-3 md:h-20 md:w-28" />
          <h1 className="border-b-2 border-transparent text-2xl transition group-hover:border-destructive group-hover:text-destructive group-active:border-destructive group-active:text-destructive md:text-3xl">Todays Office</h1>
        </button>
        <img
          src={officeLogo.url}
          alt="The Office"
          width={654}
          height={420}
          className="h-12 w-auto shrink-0 object-contain md:h-16"
        />
      </header>

      <main className="px-4 md:px-6">
        {account}
        <div className="relative flex flex-col items-start gap-3 pt-4 md:flex-row md:items-center">
          <h2 className="text-xl md:text-2xl">Hey you! Ready to pretend we have our lives together?</h2>
          <div className="flex items-center gap-6 bg-secondary px-3 py-3 md:mx-auto">
            <button aria-label="Previous day" onClick={() => setDate((d) => shiftDay(d, -1))}>
              <ChevronLeft />
            </button>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <button aria-label="Choose day" className="flex items-center gap-2 text-2xl">
                  {formatDay(date)} <CalendarDays className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  defaultMonth={date}
                  weekStartsOn={1}
                  onSelect={(d) => {
                    if (d) setDate(d);
                    setCalOpen(false);
                  }}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <button aria-label="Next day" onClick={() => setDate((d) => shiftDay(d, 1))}>
              <ChevronRight />
            </button>
          </div>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex flex-col bg-card p-6">
            <h3 className="mb-6 text-center text-3xl">To Do</h3>
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
                todo.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} onEdit={edit} />
                ))

              )}
              {adding && (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                    placeholder="New task…"
                    className="min-w-0 flex-1 border border-input bg-muted px-3 py-1 text-lg outline-none focus:ring-2 focus:ring-ring"
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
              {done.length === 0 ? (
                <div className="flex items-center justify-center gap-3 py-6">
                  <img
                    src={dwight.url}
                    alt="Dwight Schrute looking seriously at the camera"
                    width={494}
                    height={353}
                    className="h-20 w-28 shrink-0 object-contain"
                  />
                  <span className="text-xl">Less talking. More doing.</span>
                </div>
              ) : (
                done.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} onEdit={edit} />

                ))
              )}
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
                  <p className="text-lg text-muted-foreground">{sideEyeLine(lastWeek.length)}</p>
                </div>
                {sideOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
              {sideOpen && (
                <div className="mt-4 space-y-3">
                  {lastWeek.length === 0 && <p className="text-muted-foreground">Nothing left behind. Nice.</p>}
                  {lastWeek.map((t) => (
                    <TaskRow key={t.id} task={t} onToggle={toggle} onRemove={remove} onEdit={edit} />
                  ))}
                </div>
              )}
            </div>

            <div className="min-h-36 bg-secondary p-4 text-secondary-foreground">
              <p className="flex items-center gap-4">
                <NotebookText className="h-5 w-5" /> Michaels daily wisdom
              </p>
              <p className="mt-3 text-lg">“{QUOTES[date.getDay()]}”</p>
              <p className="mt-6 text-xs">– Michael Scott</p>
            </div>

            <div className="flex items-center gap-8 border-2 border-border bg-muted p-4">
              <img src={dwight.url} alt="Dwight Schrute looking seriously at the camera" width={494} height={353} loading="lazy" className="h-16 w-24 shrink-0 object-contain" />
              <div>
                <p className="text-2xl">Reminders</p>
                <p className="text-xl text-muted-foreground">Dont spill the coffee!!!</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-3xl">Notes</h3>
            <div className="grid grid-cols-2 gap-4">
              {notes.map((n) => (
                <NoteCard key={n.id} note={n} onEdit={editNote} onRemove={removeNote} />
              ))}
              <button
                onClick={addNote}
                className="flex min-h-32 items-center justify-center bg-note-cream text-sm transition hover:brightness-95"
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

function NoteCard({
  note,
  onEdit,
  onRemove,
}: {
  note: Note;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [note.text]);

  return (
    <div className="group relative">
      <div className={`relative min-h-32 shadow-sm ${NOTE_STYLES[note.color]}`}>
        <textarea
          ref={ref}
          data-note={note.id}
          value={note.text}
          onChange={(e) => onEdit(note.id, e.target.value)}
          onBlur={() => {
            if (!note.text.trim()) onRemove(note.id);
          }}
          placeholder="Write here…"
          aria-label="Note text"
          rows={3}
          className="block h-full w-full resize-none overflow-hidden break-words bg-transparent p-5 font-typewriter text-sm text-inherit outline-none placeholder:opacity-50"
        />
      </div>
      <button
        aria-label={`Delete note: ${note.text.trim() || "empty note"}`}
        onClick={() => onRemove(note.id)}
        className="absolute -right-4 -top-4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);

  const start = () => {
    setDraft(task.text);
    setEditing(true);
  };
  const save = () => {
    if (draft.trim()) onEdit(task.id, draft.trim());
    setEditing(false);
  };
  const cancel = () => {
    setDraft(task.text);
    setEditing(false);
  };

  return (

    <div className="group flex min-w-0 items-center gap-2 overflow-hidden bg-muted px-2 py-0.5 md:gap-3">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 shrink-0 accent-primary"
        aria-label={task.text}
      />
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          onBlur={save}
          aria-label="Edit task text"
          className="min-w-0 flex-1 border border-input bg-background px-2 py-0.5 text-xl outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <span className="min-w-0 flex-1 break-words text-xl">{task.text}</span>
      )}
      <button
        aria-label={`Edit task: ${task.text}`}
        onClick={start}
        className="shrink-0 p-1 opacity-0 transition group-hover:opacity-60 group-focus-within:opacity-60 [@media(hover:none)]:opacity-60"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        aria-label="Delete task"
        onClick={() => onRemove(task.id)}
        className="shrink-0 p-1 opacity-0 transition group-hover:opacity-60 group-focus-within:opacity-60 [@media(hover:none)]:opacity-60"
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
