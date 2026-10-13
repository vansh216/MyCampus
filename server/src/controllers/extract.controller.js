import { asyncHandler } from "../utils/asyncHandler.js";
import { extractEventFromText } from "../services/ai.service.js";

export const extractFromText = asyncHandler(async (req, res) => {
  const result = await extractEventFromText(req.validated.body.text);
  res.json(result);
});