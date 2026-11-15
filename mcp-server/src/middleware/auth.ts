import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

function equalSecret(a: string, b: string) {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
export function requireApiAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || !equalSecret(token, config.apiBearerToken)) return res.status(401).json({ error: "Unauthorized" });
  next();
}
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key") ?? "";
  const actor = req.header("x-admin-telegram-id") ?? "";
  if (!key || !equalSecret(key, config.adminApiKey) || !config.adminTelegramIds.includes(actor)) {
    return res.status(403).json({ error: "Admin access denied" });
  }
  res.locals.adminActor = actor;
  next();
}
