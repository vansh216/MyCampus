import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { uploadPoster } from "../middleware/upload.js";
import { extractTextSchema } from "../validators/extract.validator.js";
import { extractFromText, extractFromPoster } from "../controllers/extract.controller.js";

const router = Router();

router.post("/text", validate(extractTextSchema), extractFromText);
router.post("/poster", uploadPoster, extractFromPoster);

export default router;