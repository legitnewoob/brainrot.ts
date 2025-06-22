// src/routes/caption.routes.ts
import { Router } from "express";
import { finalProduct } from "../controllers/generate.controller";

const router = Router();


const service_name = "Brainrot.ts";
router.get("/", (_req, res) => {
  res.status(200).json({
    message: `🧠 This endpoint uses ${service_name} api service`,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});
// POST /api/captions
router.post("/create", finalProduct);

export default router;
