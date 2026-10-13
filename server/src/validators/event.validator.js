import { z } from "zod";

export const EVENT_TYPES = ["HACKATHON", "COMPETITION", "WORKSHOP", "CONFERENCE", "OTHER"];
export const EVENT_MODES = ["ONLINE", "OFFLINE", "HYBRID"];
export const EVENT_STATUSES = ["REGISTERED", "SUBMITTED", "SHORTLISTED", "REJECTED", "COMPLETED"];
export const EVENT_SOURCES = ["POSTER", "TEXT", "MANUAL"];

// Empty strings and null become null, so clearing a field works
const emptyToNull = (v) => (v === "" || v === null ? null : v);

const optionalText = (max = 2000) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().trim().url("Must be a valid URL").nullable().optional()
);

const optionalDate = z.preprocess(emptyToNull, z.coerce.date().nullable().optional());

const dateOrder = (data, ctx) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "endDate must be on or after startDate",
    });
  }
};

const nonEmpty = (obj) => Object.keys(obj).length > 0;

export const roundSchema = z.object({
  name: z.string().trim().min(1, "Round name is required").max(120),
  order: z.coerce.number().int().min(1).optional(),
  description: optionalText(),
  startAt: optionalDate,
  endAt: optionalDate,
  deadline: optionalDate,
});

export const updateRoundSchema = roundSchema
  .partial()
  .refine(nonEmpty, "Provide at least one field to update");

const eventBase = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(5000),
  organizer: optionalText(200),
  type: z.enum(EVENT_TYPES).optional(),
  mode: z.enum(EVENT_MODES).optional(),
  venue: optionalText(300),
  registrationLink: optionalUrl,
  registrationDeadline: optionalDate,
  startDate: z.coerce.date(),
  endDate: optionalDate,
  status: z.enum(EVENT_STATUSES).optional(),
  source: z.enum(EVENT_SOURCES).optional(),
  posterPath: optionalText(500),
  rawText: optionalText(20000),
});

export const createEventSchema = eventBase
  .extend({ rounds: z.array(roundSchema).max(20).optional() })
  .superRefine(dateOrder);

export const updateEventSchema = eventBase
  .partial()
  .refine(nonEmpty, "Provide at least one field to update")
  .superRefine(dateOrder);

export const statusSchema = z.object({
  status: z.enum(EVENT_STATUSES),
});

export const listEventsQuerySchema = z.object({
  status: z.enum(EVENT_STATUSES).optional(),
  type: z.enum(EVENT_TYPES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().trim().optional(),
});