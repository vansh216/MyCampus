import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import eventRoutes from "./routes/event.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import extractRoutes from "./routes/extract.routes.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

const app = express();

app.use(cors(process.env.CLIENT_URL));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "MyCampus API is running" });
});

app.use("/api/health", healthRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/extract", extractRoutes);
app.use("/uploads", express.static(UPLOAD_DIR));

app.use(notFound);
app.use(errorHandler);

export default app;