import { Router } from "express";
import {enqueueRender , fetchJob , killJob} from "../controllers/render.controller";

const router = Router();

router.post("/", enqueueRender);           // POST /renders/
router.get("/:jobId", fetchJob);         // GET /renders/:jobId
router.delete("/:jobId", killJob);   // DELETE /renders/:jobId

export default router;