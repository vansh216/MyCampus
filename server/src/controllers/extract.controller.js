import fs from "node:fs/promises";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { extractEventFromText, extractEventFromImage } from "../services/ai.service.js";

export const extractFromText = asyncHandler(async (req, res) => {
  const result = await extractEventFromText(req.validated.body.text);
  res.json(result);
});

// Check the real file bytes, because the browser-sent type can be faked
function detectImageType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "image/png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") {
    return "image/webp";
  }
  return null;
}

export const extractFromPoster = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'Please upload an image in the "poster" field');
  }

  const removeFile = () => fs.unlink(req.file.path).catch(() => {});

  try {
    const buffer = await fs.readFile(req.file.path);
    const mimeType = detectImageType(buffer);
    if (!mimeType) {
      throw new HttpError(400, "The file is not a valid JPG, PNG or WEBP image");
    }

    const result = await extractEventFromImage(buffer, mimeType, `/uploads/${req.file.filename}`);
    res.json(result);
  } catch (err) {
    await removeFile(); // do not keep posters that failed
    throw err;
  }
});