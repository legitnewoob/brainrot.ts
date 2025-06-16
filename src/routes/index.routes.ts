import { Router } from "express";

const router = Router();

/**
 * GET /
 * Basic health check for uptime monitoring or sanity test
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    message: "🧠 Brainrot-renderer is up and running!",
    timestamp: new Date().toISOString(),
  });
});

export default router;