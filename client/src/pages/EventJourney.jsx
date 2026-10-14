import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assetUrl } from "../api/client.js";
import { addRound, deleteEvent, deleteRound, getEvent, updateStatus } from "../api/events.js";
import { formatDayTime, formatRange, fromInputValue } from "../utils/dates.js";
import { STATUSES, statusInfo, TYPE_LABELS } from "../utils/events.js";
import { buttonClass, quietButtonClass, pageTitleClass } from "../components/ui.js";

const MODE_LABELS = { ONLINE: "Online", OFFLINE: "In person", HYBRID: "Hybrid" };

const inputClass =
  "mt-2 w-full rounded-md border border-chalk/25 bg-transparent px-3 py-2.5 text-base outline-none transition-colors placeholder:text-dim focus:border-sun";

// The stops on the path: registration, each round, then the event itself.
function buildPath(event) {
  const stops = [];

  if (event.registrationDeadline) {
    stops.push({
      key: "registration",
      title: "Registration",
      note: "Closes",
      at: new Date(event.registrationDeadline),
    });
  }

  const rounds = [...(event.rounds ?? [])].sort((a, b) => a.order - b.order);
  for (const r of rounds) {
    const date = r.deadline ?? r.startAt ?? r.endAt;
    stops.push({
      key: r.id,
      roundId: r.id,
      title: r.name,
      note: r.deadline ? "Due" : "Starts",
      at: date ? new Date(date) : null,
      description: r.description,
    });
  }

  stops.push({
    key: "event",
    title: "The event",
    note: event.venue || (event.mode === "ONLINE" ? "Online" : ""),
    range: formatRange(event.startDate, event.endDate),
    at: new Date(event.startDate),
  });

  return stops;
}

// done, next or later, for every stop
function markStops(stops, status) {
  if (status === "COMPLETED") return stops.map((s) => ({ ...s, state: "done" }));
  const now = new Date();
  let nextTaken = false;
  return stops.map((s) => {
    if (s.at && s.at < now) return { ...s, state: "done" };
    if (!nextTaken && status !== "REJECTED") {
      nextTaken = true;
      return { ...s, state: "next" };
    }
    return { ...s, state: "later" };
  });
}

const dotClass = {
  done: "border-mint bg-mint",
  next: "border-sun bg-board ring-4 ring-sun/25",
  later: "border-chalk/40 bg-board",
};

function PathStop({ stop, last, onRemove, removing }) {
  return (
    <li className="relative pb-9 pl-9 last:pb-0">
      {!last && <span aria-hidden="true" className="absolute left-[7px] top-5 h-full w-px bg-rule" />}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 ${dotClass[stop.state]}`}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className={`text-lg font-semibold ${stop.state === "later" ? "text-dim" : ""}`}>
          {stop.title}
          {stop.state === "next" && <span className="ml-3 text-[15px] font-medium text-sun">Up next</span>}
          {stop.state === "done" && <span className="ml-3 text-[15px] font-medium text-mint">Done</span>}
        </p>
        {stop.roundId && (
          <button
            type="button"
            disabled={removing}
            onClick={() => onRemove(stop.roundId)}
            className="text-sm text-dim underline-offset-4 hover:text-rose hover:underline disabled:opacity-50"
          >
            Remove round
          </button>
        )}
      </div>
      <p className="mt-0.5 text-dim">
        {stop.range ?? (stop.at ? `${stop.note} ${formatDayTime(stop.at)}` : "No date yet")}
        {stop.range && stop.note ? `, ${stop.note}` : ""}
      </p>
      {stop.description && <p className="mt-2 max-w-xl text-dim">{stop.description}</p>}
    </li>
  );
}

function AddRound({ eventId, nextOrder, onAdded }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the round a name.");
    setBusy(true);
    setError("");
    try {
      await addRound(eventId, {
        name: name.trim(),
        order: nextOrder,
        deadline: fromInputValue(deadline),
      });
      setName("");
      setDeadline("");
      setOpen(false);
      await onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${quietButtonClass} mt-8`}>
        Add a round
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid max-w-xl gap-4 border-t border-rule pt-6 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor="round-name" className="font-medium">
          Round name
        </label>
        <input id="round-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="round-deadline" className="font-medium">
          Deadline <span className="font-normal text-dim">(optional)</span>
        </label>
        <input id="round-deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
      </div>
      {error && (
        <p role="alert" className="text-rose sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex gap-4 sm:col-span-2">
        <button type="submit" disabled={busy} className={`${buttonClass} disabled:opacity-60`}>
          {busy ? "Adding..." : "Add round"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-dim underline-offset-4 hover:text-chalk hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function EventJourney() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(
    async (signal) => {
      try {
        setEvent(await getEvent(id, { signal }));
        setPhase("ready");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.status === 404 ? "We could not find this event." : err.message);
        setPhase("error");
      }
    },
    [id]
  );

  useEffect(() => {
    setPhase("loading");
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const stops = useMemo(() => (event ? markStops(buildPath(event), event.status) : []), [event]);

  async function run(action) {
    setBusy(true);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const changeStatus = (e) => {
    const status = e.target.value;
    run(async () => {
      await updateStatus(id, status);
      setEvent((ev) => ({ ...ev, status }));
    });
  };

  const removeRound = (roundId) =>
    run(async () => {
      await deleteRound(id, roundId);
      await load();
    });

  const remove = () =>
    run(async () => {
      await deleteEvent(id);
      navigate("/app/timeline");
    });

  if (phase === "loading") {
    return (
      <p role="status" className="text-dim">
        Loading the event
      </p>
    );
  }

  if (phase === "error") {
    return (
      <div role="alert" className="max-w-lg">
        <p className="text-xl font-semibold text-rose">Could not open this event.</p>
        <p className="mt-2 text-dim">{error}</p>
        <Link to="/app/timeline" className={`${quietButtonClass} mt-6`}>
          Back to the timeline
        </Link>
      </div>
    );
  }

  const info = statusInfo(event.status);
  const poster = assetUrl(event.posterPath);
  const facts = [
    ["When", formatRange(event.startDate, event.endDate)],
    ["Where", event.venue || (event.mode === "ONLINE" ? "Online" : null)],
    ["Format", MODE_LABELS[event.mode]],
    ["Organizer", event.organizer],
  ].filter(([, v]) => v);

  return (
    <div>
      <Link to="/app/timeline" className="text-dim underline-offset-4 hover:text-chalk hover:underline">
        Timeline
      </Link>

      <p className={`mt-8 font-medium ${info.tone}`}>
        {TYPE_LABELS[event.type] ?? "Event"}, {info.label.toLowerCase()}
      </p>
      <h1 className={`${pageTitleClass} mt-2 max-w-4xl`}>{event.title}</h1>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="path-heading">
          <h2 id="path-heading" className="text-xl font-semibold">
            Your path
          </h2>
          {event.status === "REJECTED" && (
            <p className="mt-2 text-dim">You were not shortlisted for this one. The later steps are greyed out.</p>
          )}
          <ol className="mt-6">
            {stops.map((s, i) => (
              <PathStop key={s.key} stop={s} last={i === stops.length - 1} onRemove={removeRound} removing={busy} />
            ))}
          </ol>
          <AddRound eventId={id} nextOrder={(event.rounds?.length ?? 0) + 1} onAdded={() => load()} />
        </section>

        <aside className="space-y-10">
          <div>
            <label htmlFor="status" className="text-xl font-semibold">
              Where you are
            </label>
            <select id="status" value={event.status} onChange={changeStatus} disabled={busy} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-board">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <dl className="space-y-4">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-dim">{label}</dt>
                <dd className="mt-0.5">{value}</dd>
              </div>
            ))}
            {event.registrationLink && (
              <div>
                <dt className="text-sm text-dim">Registration link</dt>
                <dd className="mt-0.5 break-all">
                  <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="text-sun underline-offset-4 hover:underline">
                    {event.registrationLink}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {event.description && <p className="whitespace-pre-line text-dim">{event.description}</p>}

          {poster && <img src={poster} alt={`Poster for ${event.title}`} className="w-full rounded-md border border-rule" />}

          {actionError && (
            <p role="alert" className="text-rose">
              {actionError}
            </p>
          )}

          <div>
            {confirmDelete ? (
              <div>
                <p className="font-medium">Delete this event and its rounds?</p>
                <p className="mt-1 text-dim">This cannot be undone.</p>
                <div className="mt-4 flex gap-5">
                  <button type="button" onClick={remove} disabled={busy} className="rounded-md bg-rose px-4 py-2 font-semibold text-board disabled:opacity-60">
                    {busy ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-dim underline-offset-4 hover:text-chalk hover:underline">
                    Keep it
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-dim underline-offset-4 hover:text-rose hover:underline">
                Delete event
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}