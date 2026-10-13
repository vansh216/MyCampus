import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "mycampus-server",
    time: new Date().toISOString(),
  });
});

router.get("/db", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const events = await prisma.event.count();
    res.json({ status: "ok", database: "connected", events });
  } catch (err) {
    next(err);
  }
});

export default router;
