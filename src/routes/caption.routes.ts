// src/routes/caption.routes.ts
import { Router } from "express";
import { generateCaptions } from "../controllers/caption.controller";

const router = Router();


const service_name = "Whisper STT"
router.get("/", (_req, res) => {
  res.status(200).json({
    message: `🧠 This endpoint uses ${service_name} api service`,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});
// POST /api/captions
router.post("/create", generateCaptions);

export default router;