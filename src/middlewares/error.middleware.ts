import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("🔥 Error:", err);

  res.status(500).json({
    message: "Something went wrong.",
    error: process.env.NODE_ENV === "development" ? String(err) : undefined,
  });
}