import { Router } from "express";
import { createAudio } from "../controllers/audio.controller";

const router = Router();

/**
 * POST /audios
 * Body: { "text": "Hello world" }
 * Response: { id, url }
 */

const service_name = "Elevenlabs TTS"

router.get("/", (_req, res) => {
  res.status(200).json({
    message: `🧠 This endpoint uses ${service_name} api service`,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});

router.post("/", createAudio);

export default router;