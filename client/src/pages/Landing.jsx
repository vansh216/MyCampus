import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- content (edit the text here) ---------- */

const board = [
  { date: "5 Nov", title: "TechSprint 2026", next: "Registration closes at 6:00 pm", status: "Open", tone: "sky" },
  { date: "10 Nov", title: "Smart India Hackathon", next: "Screening PPT due by 11:59 pm", status: "Due", tone: "sun" },
  { date: "14 Nov", title: "TechSprint 2026", next: "Shortlist announced", status: "Waiting", tone: "dim" },
];

const clash = [
  { date: "20 Nov", title: "Smart India Hackathon", next: "Finale at IIT Delhi, 9:00 am", status: "Clash", tone: "rose" },
  { date: "20 Nov", title: "Cloud Workshop", next: "10:00 am, Room 204", status: "Clash", tone: "rose" },
];

const groups = [
  {
    title: "Add an event",
    items: [
      { name: "Upload a poster", text: "A photo or screenshot is enough. MyCampus reads it." },
      { name: "Paste or type", text: "Paste an email or a WhatsApp message, or fill in the details yourself." },
      { name: "Check, then save", text: "Name, dates, venue, rounds and links are filled in. You confirm before anything is saved." },
    ],
  },
  {
    title: "See all of it",
    items: [
      { name: "One timeline", text: "Every event in a list or on a calendar." },
      { name: "Every round", text: "Screening, round 2 and the finale each sit on their own date." },
      { name: "Event journey", text: "Open an event to see where it stands, from registration to result." },
    ],
  },
  {
    title: "Stay on top of it",
    items: [
      { name: "Status tracking", text: "Registered, submitted, shortlisted, rejected or completed." },
      { name: "Clash alerts", text: "A warning when two events overlap.", soon: true },
      { name: "Email and WhatsApp reminders", text: "Deadline alerts where you already look.", soon: true },
    ],
  },
];

const journey = [
  { name: "Registered", note: "2 Nov", state: "done" },
  { name: "Submitted", note: "10 Nov", state: "now" },
  { name: "Shortlisted", note: "Pending", state: "next" },
  { name: "Completed", note: "Pending", state: "next" },
];

/* ---------- shared styles ---------- */

const wrap = "mx-auto max-w-7xl px-5 sm:px-8";
const section = "border-t border-rule py-20 sm:py-28";
const h2 =
  "max-w-2xl text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.01em] [font-stretch:90%]";
const button =
  "inline-flex items-center rounded-md bg-sun px-5 py-3 text-base font-semibold text-board transition-colors hover:bg-[#f6dd86]";
const tones = { sky: "text-sky", sun: "text-sun", dim: "text-dim", rose: "text-rose" };
const dots = {
  done: "border-chalk bg-chalk",
  now: "border-sun bg-sun shadow-[0_0_0_6px_rgb(239_208_98/0.25)]",
  next: "border-dim bg-board",
};

/* ---------- small helpers ---------- */

function useInView(threshold = 0.5) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen];
}

function Row({ date, title, next, status, tone }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-x-4 border-t border-rule px-1 py-4">
      <span className="col-start-1 row-start-1 tabular-nums">{date}</span>
      <span className="col-start-2 row-start-1 font-semibold">{title}</span>
      <span className={`col-start-3 row-start-1 text-right font-medium ${tones[tone]}`}>{status}</span>
      <span className="col-span-2 col-start-2 row-start-2 text-dim">{next}</span>
    </li>
  );
}

/* ---------- sections ---------- */

function Nav() {
  return (
    <header className={`${wrap} flex w-full items-center justify-between py-5`}>
      <Link to="/" className="text-2xl font-bold tracking-tight [font-stretch:90%]">
        MyCampus
      </Link>
      <nav className="flex items-center gap-7 text-[15px]">
        <a href="#features" className="hidden text-dim hover:text-chalk sm:inline">
          Features
        </a>
        <a href="#journey" className="hidden text-dim hover:text-chalk sm:inline">
          Journey
        </a>
        <Link
          to="/app"
          className="rounded-md border border-chalk/30 px-4 py-2 font-medium transition-colors hover:border-sun hover:text-sun"
        >
          Open app
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  const [ref, seen] = useInView();

  return (
    <div className={`${wrap} flex w-full flex-1 items-center pb-16 pt-6 sm:pt-10`}>
      <div className="grid w-full items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <h1 className="text-[clamp(2.9rem,11vw,5rem)] font-bold leading-[0.95] tracking-[-0.01em] [font-stretch:90%] lg:text-[clamp(3.5rem,5.6vw,5.5rem)]">
            All your events on one timeline.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-chalk/80">
            Registrations, deadlines, venues and rounds are scattered across emails, posters and a dozen
            platforms. MyCampus collects them into one schedule and shows what is due next.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/app" className={button}>
              Open MyCampus
            </Link>
            <a
              href="#features"
              className="underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-sun"
            >
              See what it does
            </a>
          </div>
        </div>

        <div className="w-full max-w-lg lg:max-w-none">
          <div className="flex items-baseline justify-between pb-3">
            <p className="text-xl font-semibold">Your timeline</p>
            <p className="text-sm text-dim">Sample data</p>
          </div>

          <ol>
            {board.map((row) => (
              <Row key={row.date + row.title} {...row} />
            ))}

            <li ref={ref} className="relative">
              <ol>
                {clash.map((row) => (
                  <Row key={row.date + row.title} {...row} />
                ))}
              </ol>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 130"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -left-[1.1rem] -top-3 h-[calc(100%+1.5rem)] w-[6.5rem] overflow-visible text-rose"
              >
                <path
                  className="chalk-circle"
                  data-drawn={seen}
                  pathLength="1"
                  d="M52 6 C 90 4, 98 40, 94 70 C 90 110, 60 126, 36 120 C 8 112, 4 70, 8 44 C 12 18, 40 8, 74 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </li>
          </ol>

          <p className="mt-4 text-sm text-dim">Events that overlap get circled, so you catch the clash early.</p>
        </div>
      </div>
    </div>
  );
}

function Scattered() {
  return (
    <section className={section}>
      <div className={wrap}>
        <p className="max-w-3xl text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.15] tracking-[-0.01em] text-dim">
          Registrations are on Unstop. Deadlines come by email. The venue is on a poster. The submission link
          is somewhere in a WhatsApp group.
        </p>
        <p className="mt-8 max-w-3xl text-[clamp(1.5rem,3.6vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.01em]">
          Miss one and you miss the event. MyCampus keeps all of it in one place.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className={`${section} scroll-mt-4`}>
      <div className={wrap}>
        <h2 className={h2}>Add it once. It stays on your timeline.</h2>

        <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-rule">
          {groups.map((group) => (
            <li key={group.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <h3 className="text-2xl font-bold [font-stretch:90%]">{group.title}</h3>
              <ul className="mt-6 space-y-6">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <p className="font-semibold">
                      {item.name}
                      {item.soon && (
                        <span className="ml-2 whitespace-nowrap text-sm font-normal text-sun">Coming soon</span>
                      )}
                    </p>
                    <p className="mt-1 max-w-xs text-dim">{item.text}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section id="journey" className={`${section} scroll-mt-4`}>
      <div className={wrap}>
        <h2 className={h2}>Follow each event to the end.</h2>
        <p className="mt-5 max-w-lg text-lg text-chalk/80">
          Open any event to see where it stands and what comes next.
        </p>

        <ol className="relative mt-14 grid gap-10 sm:grid-cols-4 sm:gap-0">
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-rule sm:bottom-auto sm:left-0 sm:right-0 sm:top-[9px] sm:h-0.5 sm:w-auto"
          />
          {journey.map((step) => (
            <li key={step.name} className="relative pl-10 sm:pl-0 sm:pt-10">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0.5 size-5 rounded-full border-2 sm:top-0 ${dots[step.state]}`}
              />
              <p className="text-xl font-semibold">{step.name}</p>
              <p className="mt-0.5 text-dim">{step.note}</p>
              {step.state === "now" && <p className="mt-1 font-medium text-sun">You are here</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={section}>
      <div className={wrap}>
        <h2 className="max-w-3xl text-[clamp(2.2rem,6vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.015em] [font-stretch:90%]">
          Stop checking a dozen places.
        </h2>
        <Link to="/app" className={`${button} mt-10`}>
          Open MyCampus
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className={`${wrap} flex flex-wrap items-baseline justify-between gap-2 py-8 text-sm text-dim`}>
        <p className="font-semibold text-chalk">MyCampus</p>
        <p>Your event journey, in one place.</p>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <main>
        {/* first screen: the hero fills the whole viewport */}
        <div className="flex min-h-svh flex-col">
          <Nav />
          <Hero />
        </div>

        <Scattered />
        <Features />
        <Journey />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}