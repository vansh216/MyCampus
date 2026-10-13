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
   if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Image is too large. Maximum size is 5 MB.";
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    status = 400;
    message = 'Upload the image in a field named "poster".';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.nodeEnv === "development" && status >= 500 ? { stack: err.stack } : {}),
  });
}