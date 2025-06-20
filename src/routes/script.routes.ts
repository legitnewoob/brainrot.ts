import { Router } from "express";
import {
  createScript
} from "../controllers/script.controller";

const router = Router();

router.post("/create", createScript);           // POST /renders
// router.get("/:id", getScript);         // GET /renders/:jobId

export default router;