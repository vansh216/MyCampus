export const STATUSES = [
  { value: "REGISTERED", label: "Registered", tone: "text-sky" },
  { value: "SUBMITTED", label: "Submitted", tone: "text-sun" },
  { value: "SHORTLISTED", label: "Shortlisted", tone: "text-mint" },
  { value: "REJECTED", label: "Rejected", tone: "text-rose" },
  { value: "COMPLETED", label: "Completed", tone: "text-dim" },
];

export const statusInfo = (value) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];

export const TYPE_LABELS = {
  HACKATHON: "Hackathon",
  COMPETITION: "Competition",
  WORKSHOP: "Workshop",
  CONFERENCE: "Conference",
  OTHER: "Event",
};

// The next deadline that still matters for this event, or null.
export function nextDeadline(event, now = new Date()) {
  if (event.status === "REJECTED" || event.status === "COMPLETED") return null;

  const items = [];
  if (event.status === "REGISTERED" && event.registrationDeadline) {
    items.push({ label: "Registration closes", at: new Date(event.registrationDeadline) });
  }
  for (const round of event.rounds ?? []) {
    if (round.deadline) items.push({ label: `${round.name} due`, at: new Date(round.deadline) });
  }

  return items.filter((i) => i.at >= now).sort((a, b) => a.at - b.at)[0] ?? null;
}

export const isPast = (event, now = new Date()) =>
  new Date(event.endDate ?? event.startDate) < now;