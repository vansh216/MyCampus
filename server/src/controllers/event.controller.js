import prisma from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const withRounds = { rounds: { orderBy: { order: "asc" } } };

async function getEventOr404(id) {
  const event = await prisma.event.findUnique({ where: { id }, include: withRounds });
  if (!event) throw new HttpError(404, "Event not found");
  return event;
}

// ---------- Events ----------

export const createEvent = asyncHandler(async (req, res) => {
  const { rounds = [], ...data } = req.validated.body;

  const event = await prisma.event.create({
    data: {
      ...data,
      rounds: {
        create: rounds.map((r, i) => ({ ...r, order: r.order ?? i + 1 })),
      },
    },
    include: withRounds,
  });

  res.status(201).json(event);
});

export const listEvents = asyncHandler(async (req, res) => {
  const { status, type, from, to, q } = req.validated.query;

  const where = {
    ...(status && { status }),
    ...(type && { type }),
    ...(q && { title: { contains: q, mode: "insensitive" } }),
    ...((from || to) && {
      startDate: { ...(from && { gte: from }), ...(to && { lte: to }) },
    }),
  };

  const events = await prisma.event.findMany({
    where,
    include: withRounds,
    orderBy: { startDate: "asc" },
  });

  res.json({ count: events.length, events });
});

export const getEvent = asyncHandler(async (req, res) => {
  res.json(await getEventOr404(req.params.id));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const existing = await getEventOr404(req.params.id);
  const data = req.validated.body;

  const startDate = data.startDate ?? existing.startDate;
  const endDate = data.endDate === undefined ? existing.endDate : data.endDate;
  if (endDate && endDate < startDate) {
    throw new HttpError(400, "endDate must be on or after startDate");
  }

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data,
    include: withRounds,
  });

  res.json(event);
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: { status: req.validated.body.status },
    include: withRounds,
  });

  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Rounds ----------

export const addRound = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  const exists = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!exists) throw new HttpError(404, "Event not found");

  const { _max } = await prisma.round.aggregate({
    where: { eventId },
    _max: { order: true },
  });
  const order = req.validated.body.order ?? (_max.order ?? 0) + 1;

  const round = await prisma.round.create({
    data: { ...req.validated.body, order, eventId },
  });

  res.status(201).json(round);
});

export const updateRound = asyncHandler(async (req, res) => {
  const { id: eventId, roundId } = req.params;

  const round = await prisma.round.findFirst({ where: { id: roundId, eventId } });
  if (!round) throw new HttpError(404, "Round not found for this event");

  const updated = await prisma.round.update({
    where: { id: roundId },
    data: req.validated.body,
  });

  res.json(updated);
});

export const deleteRound = asyncHandler(async (req, res) => {
  const { id: eventId, roundId } = req.params;

  const round = await prisma.round.findFirst({ where: { id: roundId, eventId } });
  if (!round) throw new HttpError(404, "Round not found for this event");

  await prisma.round.delete({ where: { id: roundId } });
  res.status(204).send();
});