import { Router } from "express";
import {enqueueRender , fetchJob , killJob} from "../controllers/render.controller";

const router = Router();

const service_name = "Remotion renderer"

router.get("/", (_req, res) => {
  res.status(200).json({
    message: `🧠 This endpoint uses ${service_name} api service`,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});

router.post("/", enqueueRender);           // POST /renders/
router.get("/:jobId", fetchJob);         // GET /renders/:jobId
router.delete("/:jobId", killJob);   // DELETE /renders/:jobId

export default router;