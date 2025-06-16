import { Router } from "express";
import {
  createRenderJob,
  getRenderJob,
  cancelRenderJob,
} from "../controllers/render.controller";

const router = Router();

router.post("/", createRenderJob);           // POST /renders
router.get("/:jobId", getRenderJob);         // GET /renders/:jobId
router.delete("/:jobId", cancelRenderJob);   // DELETE /renders/:jobId

export default router;