import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  // Prisma: record to update/delete was not found
  if (err.code === "P2025") {
    status = 404;
    message = "Record not found";
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.nodeEnv === "development" && status >= 500 ? { stack: err.stack } : {}),
  });
}