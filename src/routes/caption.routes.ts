// src/routes/caption.routes.ts
import { Router } from "express";
import { generateCaptions } from "../controllers/caption.controller";

const router = Router();

// POST /api/captions
router.post("/create", generateCaptions);

export default router;