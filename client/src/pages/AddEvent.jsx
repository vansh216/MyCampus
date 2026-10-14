import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent, extractFromPoster, extractFromText } from "../api/events.js";
import { toInputValue, fromInputValue } from "../utils/dates.js";
import { STATUSES } from "../utils/events.js";
import { buttonClass, quietButtonClass, pageTitleClass } from "../components/ui.js";

const TYPES = [
  ["HACKATHON", "Hackathon"],
  ["COMPETITION", "Competition"],
  ["WORKSHOP", "Workshop"],
  ["CONFERENCE", "Conference"],
  ["OTHER", "Other"],
];
const MODES = [
  ["OFFLINE", "In person"],
  ["ONLINE", "Online"],
  ["HYBRID", "Hybrid"],
];
const TABS = [
  ["poster", "Poster"],
  ["text", "Pasted text"],
  ["manual", "Type it in"],
];
const MAX_POSTER_BYTES = 5 * 1024 * 1024;
const POSTER_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "mt-2 w-full rounded-md border border-chalk/25 bg-transparent px-3 py-2.5 text-base outline-none transition-colors placeholder:text-dim focus:border-sun";

const emptyForm = {
  title: "",
  type: "HACKATHON",
  mode: "OFFLINE",
  organizer: "",
  venue: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  registrationLink: "",
  description: "",
  status: "REGISTERED",
  rounds: [],
};

// Turns what the AI sent back into form values (everything as plain strings)
function draftToForm(draft = {}) {
  return {
    ...emptyForm,
    title: draft.title ?? "",
    type: TYPES.some(([v]) => v === draft.type) ? draft.type : "OTHER",
    mode: MODES.some(([v]) => v === draft.mode) ? draft.mode : "OFFLINE",
    organizer: draft.organizer ?? "",
    venue: draft.venue ?? "",
    startDate: toInputValue(draft.startDate),
    endDate: toInputValue(draft.endDate),
    registrationDeadline: toInputValue(draft.registrationDeadline),
    registrationLink: draft.registrationLink ?? "",
    description: draft.description ?? "",
    rounds: (draft.rounds ?? []).map((r) => ({
      name: r.name ?? "",
      deadline: toInputValue(r.deadline ?? r.endAt),
      startAt: toInputValue(r.startAt),
    })),
  };
}

function Field({ label, htmlFor, hint, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-sm text-dim">{hint}</p>}
    </div>
  );
}

function ErrorLine({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-4 text-rose">
      {children}
    </p>
  );
}

/* Step 1: pick how to add the event */
function InputStep({ onDraft, onManual }) {
  const [tab, setTab] = useState("poster");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return;
    if (!POSTER_TYPES.includes(f.type)) return setError("Use a JPG, PNG or WebP image.");
    if (f.size > MAX_POSTER_BYTES) return setError("That image is over 5 MB. Try a smaller one.");
    // the review step shows this same URL, so it is not revoked when this step closes
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function read() {
    setBusy(true);
    setError("");
    try {
      const res =
        tab === "poster" ? await extractFromPoster(file) : await extractFromText(text.trim());
      onDraft({
        draft: res.draft ?? {},
        warnings: res.warnings ?? [],
        source: tab === "poster" ? "POSTER" : "TEXT",
        posterPath: res.posterPath ?? res.draft?.posterPath ?? null,
        posterPreview: tab === "poster" ? preview : null,
        rawText: tab === "text" ? text.trim() : res.rawText ?? res.draft?.rawText ?? null,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const ready = tab === "poster" ? Boolean(file) : text.trim().length >= 20;

  return (
    <>
      <div role="tablist" className="mt-10 flex gap-8 border-b border-rule">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            disabled={busy}
            onClick={() => {
              setTab(value);
              setError("");
            }}
            className={`-mb-px border-b-2 pb-3 text-[15px] transition-colors ${
              tab === value
                ? "border-sun text-chalk"
                : "border-transparent text-dim hover:text-chalk"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-2xl">
        {tab === "poster" && (
          <div>
            <p className="text-dim">Upload the poster. We read the dates, venue and links off it.</p>
            <input
              ref={fileRef}
              id="poster"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={pickFile}
              className="sr-only"
            />
            {preview ? (
              <div className="mt-6 flex items-start gap-5">
                <img
                  src={preview}
                  alt="Poster you chose"
                  className="max-h-72 w-auto max-w-[55%] rounded-md border border-rule"
                />
                <div>
                  <p className="break-all font-medium">{file.name}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className={`${quietButtonClass} mt-4`}
                  >
                    Choose a different image
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="poster"
                className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-chalk/35 px-6 py-10 text-center transition-colors hover:border-sun"
              >
                <span className="text-lg font-semibold">Choose a poster image</span>
                <span className="mt-1 text-dim">JPG, PNG or WebP, up to 5 MB</span>
              </label>
            )}
          </div>
        )}

        {tab === "text" && (
          <div>
            <label htmlFor="raw-text" className="text-dim">
              Paste the WhatsApp message, email or announcement.
            </label>
            <textarea
              id="raw-text"
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
              placeholder="Smart India Hackathon 2026. Registrations close 20 Nov..."
              className={`${inputClass} mt-4 resize-y`}
            />
          </div>
        )}

        {tab === "manual" && (
          <div>
            <p className="text-dim">No poster or message? Fill the details in yourself.</p>
            <button type="button" onClick={onManual} className={`${buttonClass} mt-6`}>
              Start with an empty form
            </button>
          </div>
        )}

        <ErrorLine>{error}</ErrorLine>

        {tab !== "manual" && (
          <div className="mt-8 flex items-center gap-5">
            <button
              type="button"
              disabled={!ready || busy}
              onClick={read}
              className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {busy ? "Reading..." : "Read details"}
            </button>
            {busy && (
              <span role="status" className="text-dim">
                This can take up to 20 seconds.
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* Step 2: check, fix, save */
function ReviewStep({ initial, onBack }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => draftToForm(initial.draft));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setRound = (i, key, value) =>
    setForm((f) => ({
      ...f,
      rounds: f.rounds.map((r, n) => (n === i ? { ...r, [key]: value } : r)),
    }));
  const addRound = () =>
    setForm((f) => ({ ...f, rounds: [...f.rounds, { name: "", deadline: "", startAt: "" }] }));
  const removeRound = (i) =>
    setForm((f) => ({ ...f, rounds: f.rounds.filter((_, n) => n !== i) }));

  const warnings = (initial.warnings ?? []).map((w) => (typeof w === "string" ? w : w.message));

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Add a title.");
    if (!form.startDate) return setError("Add a start date.");
    if (form.endDate && form.endDate < form.startDate) {
      return setError("The end date is before the start date.");
    }
    if (form.rounds.some((r) => !r.name.trim())) {
      return setError("Give every round a name, or remove the empty ones.");
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      mode: form.mode,
      organizer: form.organizer.trim() || null,
      venue: form.venue.trim() || null,
      startDate: fromInputValue(form.startDate),
      endDate: fromInputValue(form.endDate),
      registrationDeadline: fromInputValue(form.registrationDeadline),
      registrationLink: form.registrationLink.trim() || null,
      description: form.description.trim() || null,
      status: form.status,
      source: initial.source,
      posterPath: initial.posterPath,
      rawText: initial.rawText,
      rounds: form.rounds.map((r, i) => ({
        name: r.name.trim(),
        order: i + 1,
        startAt: fromInputValue(r.startAt),
        deadline: fromInputValue(r.deadline),
      })),
    };

    setSaving(true);
    try {
      await createEvent(payload);
      navigate("/app/timeline");
    } catch (err) {
      const first = err.details?.[0];
      setError(first?.message ? `${err.message}: ${first.message}` : err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-10" noValidate>
      {warnings.length > 0 && (
        <div className="mb-8 max-w-2xl border-l-2 border-sun pl-4">
          <p className="font-semibold text-sun">Check these before saving</p>
          <ul className="mt-2 space-y-1 text-dim">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" className="sm:col-span-2">
            <input id="title" value={form.title} onChange={set("title")} className={inputClass} />
          </Field>

          <Field label="Type" htmlFor="type">
            <select id="type" value={form.type} onChange={set("type")} className={inputClass}>
              {TYPES.map(([v, l]) => (
                <option key={v} value={v} className="bg-board">
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mode" htmlFor="mode">
            <select id="mode" value={form.mode} onChange={set("mode")} className={inputClass}>
              {MODES.map(([v, l]) => (
                <option key={v} value={v} className="bg-board">
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Organizer" htmlFor="organizer">
            <input id="organizer" value={form.organizer} onChange={set("organizer")} className={inputClass} />
          </Field>
          <Field label="Venue" htmlFor="venue">
            <input id="venue" value={form.venue} onChange={set("venue")} className={inputClass} />
          </Field>

          <Field label="Starts" htmlFor="startDate">
            <input id="startDate" type="datetime-local" value={form.startDate} onChange={set("startDate")} className={inputClass} />
          </Field>
          <Field label="Ends" htmlFor="endDate" hint="Optional">
            <input id="endDate" type="datetime-local" value={form.endDate} onChange={set("endDate")} className={inputClass} />
          </Field>

          <Field label="Registration closes" htmlFor="registrationDeadline" hint="Optional">
            <input id="registrationDeadline" type="datetime-local" value={form.registrationDeadline} onChange={set("registrationDeadline")} className={inputClass} />
          </Field>
          <Field label="Registration link" htmlFor="registrationLink" hint="Optional">
            <input id="registrationLink" type="url" value={form.registrationLink} onChange={set("registrationLink")} placeholder="https://" className={inputClass} />
          </Field>

          <Field label="Where you are with it" htmlFor="status">
            <select id="status" value={form.status} onChange={set("status")} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-board">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes" htmlFor="description" className="sm:col-span-2" hint="Optional">
            <textarea id="description" rows={4} value={form.description} onChange={set("description")} className={`${inputClass} resize-y`} />
          </Field>

          <div className="sm:col-span-2">
            <p className="font-medium">Rounds</p>
            {form.rounds.length === 0 && (
              <p className="mt-1.5 text-sm text-dim">
                Add a round for each stage, such as a screening or a finale, so its deadline shows on your timeline.
              </p>
            )}
            <ul className="mt-3 space-y-5">
              {form.rounds.map((r, i) => (
                <li key={i} className="grid gap-4 border-t border-rule pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor={`round-name-${i}`} className="text-sm text-dim">
                      Round {i + 1} name
                    </label>
                    <input id={`round-name-${i}`} value={r.name} onChange={(e) => setRound(i, "name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor={`round-deadline-${i}`} className="text-sm text-dim">
                      Deadline
                    </label>
                    <input id={`round-deadline-${i}`} type="datetime-local" value={r.deadline} onChange={(e) => setRound(i, "deadline", e.target.value)} className={inputClass} />
                  </div>
                  <button type="button" onClick={() => removeRound(i)} className="pb-2.5 text-left text-dim underline-offset-4 hover:text-rose hover:underline">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={addRound} className={`${quietButtonClass} mt-5`}>
              Add a round
            </button>
          </div>
        </div>

        {initial.posterPreview && (
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-medium">Your poster</p>
            <img src={initial.posterPreview} alt="Poster you uploaded" className="mt-3 w-full max-w-xs rounded-md border border-rule" />
          </aside>
        )}
      </div>

      <ErrorLine>{error}</ErrorLine>

      <div className="mt-10 flex items-center gap-6">
        <button type="submit" disabled={saving} className={`${buttonClass} disabled:opacity-60`}>
          {saving ? "Saving..." : "Save to timeline"}
        </button>
        <button type="button" onClick={onBack} disabled={saving} className="text-dim underline-offset-4 hover:text-chalk hover:underline">
          Back
        </button>
      </div>
    </form>
  );
}

export default function AddEvent() {
  const [draft, setDraft] = useState(null);

  return (
    <div>
      <h1 className={pageTitleClass}>{draft ? "Check the details" : "Add an event"}</h1>
      <p className="mt-4 max-w-xl text-dim">
        {draft
          ? "Fix anything that looks wrong. Nothing is saved until you press Save."
          : "Start from a poster or a message and we fill in the form. You check it before it is saved."}
      </p>

      {draft ? (
        <ReviewStep initial={draft} onBack={() => setDraft(null)} />
      ) : (
        <InputStep
          onDraft={setDraft}
          onManual={() =>
            setDraft({ draft: {}, warnings: [], source: "MANUAL", posterPath: null, posterPreview: null, rawText: null })
          }
        />
      )}
    </div>
  );
}