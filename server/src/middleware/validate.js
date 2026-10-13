import { HttpError } from "../utils/httpError.js";

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new HttpError(400, "Validation failed", details));
    }

    req.validated = { ...(req.validated || {}), [source]: result.data };
    next();
  };