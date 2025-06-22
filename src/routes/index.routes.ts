import { Router } from "express";

const router = Router();

/**
 * GET /
 * Basic health check for uptime monitoring or sanity test
 */

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "🧠 This Brainrot-renderer is up and running using express and node",
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Health Check");
});

export default router;