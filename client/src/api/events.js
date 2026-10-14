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

export async function getEvent(id, { signal } = {}) {
  const data = await api.get(`/api/events/${id}`, { signal });
  return data.event ?? data;
}

export function updateStatus(id, status) {
  return api.patch(`/api/events/${id}/status`, { status });
}

export function deleteEvent(id) {
  return api.delete(`/api/events/${id}`);
}

export function addRound(id, round) {
  return api.post(`/api/events/${id}/rounds`, round);
}

export function deleteRound(id, roundId) {
  return api.delete(`/api/events/${id}/rounds/${roundId}`);
}