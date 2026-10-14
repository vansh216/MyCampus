import { api } from "./client.js";

export function listEvents({ signal } = {}) {
  return api.get("/api/events", { signal });
}

export function createEvent(payload) {
  return api.post("/api/events", payload);
}

// AI extraction. Both return { draft, warnings } and save nothing.
export function extractFromText(text) {
  return api.post("/api/extract/text", { text });
}

export function extractFromPoster(file) {
  const form = new FormData();
  form.append("poster", file);
  return api.post("/api/extract/poster", form);
}