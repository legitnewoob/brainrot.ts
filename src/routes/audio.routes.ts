import { Router } from "express";
import { createAudio } from "../controllers/audio.controller";

const router = Router();

/**
 * POST /audios
 * Body: { "text": "Hello world" }
 * Response: { id, url }
 */
router.post("/", createAudio);

export default router;