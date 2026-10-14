import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../api/events.js";
import { formatRange, formatDayTime, monthKey, monthLabel } from "../utils/dates.js";
import { STATUSES, statusInfo, TYPE_LABELS, nextDeadline, isPast } from "../utils/events.js";
import { buttonClass, quietButtonClass, pageTitleClass } from "../components/ui.js";

function EventRow({ event }) {
  const info = statusInfo(event.status);
  const next = nextDeadline(event);
  const place = event.venue || (event.mode === "ONLINE" ? "Online" : "Venue not added");

  return (
    <li className="border-t border-rule">
      <Link
        to={`/app/events/${event.id}`}
        className={`grid grid-cols-[4.75rem_1fr_auto] items-baseline gap-x-4 px-1 py-5 transition-colors hover:bg-chalk/5 md:grid-cols-[7rem_1.2fr_1.3fr_6.5rem] md:gap-x-6 ${
          isPast(event) ? "opacity-75" : ""
        }`}
      >
        <span className="col-start-1 row-start-1 leading-snug tabular-nums">
          {formatRange(event.startDate, event.endDate)}
        </span>

        <span className="col-start-2 row-start-1 min-w-0">
          <span className="block text-lg font-semibold leading-snug">{event.title}</span>
          <span className="block text-dim">
            {TYPE_LABELS[event.type] ?? "Event"}, {place}
          </span>
        </span>

        <span className={`col-start-3 row-start-1 text-right font-medium md:col-start-4 ${info.tone}`}>
          {info.label}
        </span>

        {next && (
          <span className="col-span-2 col-start-2 row-start-2 mt-2 text-dim md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0">
            <span className="text-chalk">{next.label}</span> {formatDayTime(next.at)}
          </span>
        )}
      </Link>
    </li>
  );
}

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [phase, setPhase] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");

  const load = useCallback(async (signal) => {
    setPhase("loading");
    try {
      const data = await listEvents({ signal });
      setEvents(data.events);
      setPhase("ready");
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const counts = useMemo(() => {
    const c = {};
    for (const e of events) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [events]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = events.filter(
      (e) =>
        (status === "ALL" || e.status === status) &&
        (!q || [e.title, e.venue, e.organizer].some((v) => v?.toLowerCase().includes(q)))
    );

    // the API sends events soonest first, so a Map keeps the months in order
    const byMonth = new Map();
    for (const e of shown) {
      const key = monthKey(e.startDate);
      if (!byMonth.has(key)) byMonth.set(key, { label: monthLabel(e.startDate), items: [] });
      byMonth.get(key).items.push(e);
    }
    return [...byMonth.values()];
  }, [events, status, query]);

  const tabs = [
    { value: "ALL", label: "All", count: events.length },
    ...STATUSES.filter((s) => counts[s.value] > 0 || status === s.value).map((s) => ({
      value: s.value,
      label: s.label,
      count: counts[s.value] ?? 0,
    })),
  ];

  const filtering = status !== "ALL" || query.trim() !== "";

  return (
    <div>
      <h1 className={pageTitleClass}>Timeline</h1>
      <p className="mt-4 text-dim">
        {phase === "ready" && events.length > 0
          ? `${events.length} ${events.length === 1 ? "event" : "events"}, soonest first.`
          : "Every event you add shows up here, soonest first."}
      </p>

      {phase === "loading" && (
        <p role="status" className="mt-16 text-dim">
          Loading your timeline
        </p>
      )}

      {phase === "error" && (
        <div role="alert" className="mt-16 max-w-lg">
          <p className="text-xl font-semibold text-rose">Could not load your events.</p>
          <p className="mt-2 text-dim">{error}</p>
          <button type="button" onClick={() => load()} className={`${quietButtonClass} mt-6`}>
            Try again
          </button>
        </div>
      )}

      {phase === "ready" && events.length === 0 && (
        <div className="mt-16 max-w-md">
          <p className="text-2xl font-semibold">Nothing on your timeline yet.</p>
          <p className="mt-3 text-dim">
            Add an event from a poster, a pasted message, or by typing it in.
          </p>
          <Link to="/app/add" className={`${buttonClass} mt-8`}>
            Add your first event
          </Link>
        </div>
      )}

      {phase === "ready" && events.length > 0 && (
        <>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={status === t.value}
                  onClick={() => setStatus(t.value)}
                  className={`border-b-2 pb-1 text-[15px] transition-colors ${
                    status === t.value
                      ? "border-sun text-chalk"
                      : "border-transparent text-dim hover:text-chalk"
                  }`}
                >
                  {t.label} <span className="text-dim">{t.count}</span>
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>
              <input
                id="event-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events"
                className="w-full border-b border-rule bg-transparent pb-1.5 text-[15px] outline-none transition-colors placeholder:text-dim focus:border-sun sm:w-64"
              />
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="mt-14 max-w-md">
              <p className="text-xl font-semibold">No events match.</p>
              <button
                type="button"
                onClick={() => {
                  setStatus("ALL");
                  setQuery("");
                }}
                className={`${quietButtonClass} mt-5`}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              {groups.map((group) => (
                <section key={group.label}>
                  <h2 className="text-xl font-semibold">{group.label}</h2>
                  <ul className="mt-3 border-b border-rule">
                    {group.items.map((event) => (
                      <EventRow key={event.id} event={event} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {filtering && groups.length > 0 && (
            <p className="mt-6 text-sm text-dim">Filters are on. Some events may be hidden.</p>
          )}
        </>
      )}
    </div>
  );
}