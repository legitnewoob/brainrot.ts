import { Router } from "express";
import {
  createScript
} from "../controllers/script.controller";

const router = Router();

const service_name = "OpenAI creative"

router.get("/", (_req, res) => {
  res.status(200).json({
    message: `🧠 This endpoint uses ${service_name} api service`,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});

router.post("/create", createScript);           // POST /renders
// router.get("/:id", getScript);         // GET /renders/:jobId

export default router;