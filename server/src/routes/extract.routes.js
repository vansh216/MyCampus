import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { extractTextSchema } from "../validators/extract.validator.js";
import { extractFromText } from "../controllers/extract.controller.js";

const router = Router();

router.post("/text", validate(extractTextSchema), extractFromText);

export default router;