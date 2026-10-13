import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createEventSchema,
  updateEventSchema,
  statusSchema,
  roundSchema,
  updateRoundSchema,
  listEventsQuerySchema,
} from "../validators/event.validator.js";
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  addRound,
  updateRound,
  deleteRound,
} from "../controllers/event.controller.js";

const router = Router();

router
  .route("/")
  .get(validate(listEventsQuerySchema, "query"), listEvents)
  .post(validate(createEventSchema), createEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(validate(updateEventSchema), updateEvent)
  .delete(deleteEvent);

router.patch("/:id/status", validate(statusSchema), updateEventStatus);

router.post("/:id/rounds", validate(roundSchema), addRound);

router
  .route("/:id/rounds/:roundId")
  .put(validate(updateRoundSchema), updateRound)
  .delete(deleteRound);

export default router;