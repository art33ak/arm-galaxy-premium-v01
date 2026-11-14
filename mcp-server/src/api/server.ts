import express from "express";
import helmet from "helmet";
import { z } from "zod";
import { config } from "../config.js";
import { healthCheck } from "../db.js";
import { requireApiAuth, requireAdmin } from "../middleware/auth.js";
import { requireTelegramAuth } from "../middleware/telegram.js";
import * as arm from "../services/arm.service.js";
import * as ton from "../services/ton.service.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "32kb" }));

app.get("/health", async (_req, res) => {
  try {
    await healthCheck();
    res.json({ ok: true, service: "arm-mcp-firebase", project: config.firebaseProjectId });
  } catch {
    res.status(503).json({ ok: false, service: "arm-mcp-firebase" });
  }
});

app.use("/api", requireApiAuth);
app.get("/api/users/:telegramId/balance", requireTelegramAuth, async (req, res, next) => {
  try {
    const telegramId = req.params.telegramId;
    if (typeof telegramId !== "string") return res.status(400).json({ error: "Invalid Telegram ID" });
    if (telegramId !== res.locals.telegramId) return res.status(403).json({ error: "Forbidden" });
    const result = await arm.getUserBalance(telegramId);
    result ? res.json(result) : res.status(404).json({ error: "Player not found" });
  } catch (e) { next(e); }
});
app.get("/api/users/:telegramId/level", requireTelegramAuth, async (req, res, next) => {
  try {
    const telegramId = req.params.telegramId;
    if (typeof telegramId !== "string") return res.status(400).json({ error: "Invalid Telegram ID" });
    if (telegramId !== res.locals.telegramId) return res.status(403).json({ error: "Forbidden" });
    const result = await arm.getUserLevel(telegramId);
    result ? res.json(result) : res.status(404).json({ error: "Player not found" });
  } catch (e) { next(e); }
});
app.get("/api/leaderboard", async (req, res, next) => {
  try { res.json(await arm.getLeaderboard(Number(req.query.limit ?? 10))); }
  catch (e) { next(e); }
});
app.get("/api/statistics", async (_req, res, next) => {
  try { res.json(await arm.getGameStatistics()); } catch (e) { next(e); }
});
app.get("/api/ton/jetton-supply", async (_req, res, next) => {
  try { res.json(await ton.getJettonSupply()); } catch (e) { next(e); }
});
app.get("/api/ton/transactions/:hash", async (req, res, next) => {
  try { res.json(await ton.getTonTransaction(req.params.hash)); } catch (e) { next(e); }
});
app.get("/api/stonfi/pool", async (req, res, next) => {
  try { res.json(await ton.getPoolInfo(String(req.query.address ?? ""))); } catch (e) { next(e); }
});
app.post("/api/admin/rewards", requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({
      telegramId: z.string().regex(/^\d+$/),
      amount: z.number().int().positive().max(1_000_000_000),
      reason: z.string().min(3).max(300),
      idempotencyKey: z.string().min(8).max(128)
    }).parse(req.body);
    res.status(201).json(await arm.addGameReward({ ...body, actor: res.locals.adminActor }));
  } catch (e) { next(e); }
});
app.post("/api/admin/ban", requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({
      telegramId: z.string().regex(/^\d+$/),
      reason: z.string().min(3).max(300)
    }).parse(req.body);
    res.json(await arm.banUser({ ...body, actor: res.locals.adminActor }));
  } catch (e) { next(e); }
});
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("API error:", message);
  res.status(message.includes("not found") ? 404 : 400)
    .json({ error: config.nodeEnv === "production" ? "Request failed" : message });
});
