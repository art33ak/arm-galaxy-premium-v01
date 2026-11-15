import express from "express";
import * as helmet from "helmet";
import { z } from "zod";
import { config } from "../config.js";
import { healthCheck } from "../db.js";
import { requireApiAuth, requireAdmin } from "../middleware/auth.js";
import { requireTelegramAuth } from "../middleware/telegram.js";
import * as arm from "../services/arm.service.js";
import * as ton from "../services/ton.service.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet.default());

app.get("/health", async (_req, res) => {
  try {
    await healthCheck();
    res.json({ ok: true, service: "arm-mcp-firebase" });
  } catch {
    res.status(503).json({ ok: false, service: "arm-mcp-firebase" });
  }
});

app.use("/api", requireApiAuth);
app.use(express.json({ limit: "32kb" }));

app.get("/api/users/:telegramId/balance", requireTelegramAuth, async (req, res, next) => {
  try {
    const telegramId = req.params.telegramId;
    if (typeof telegramId !== "string") {
      return res.status(400).json({ error: "Invalid Telegram ID" });
    }
    if (telegramId !== res.locals.telegramId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await arm.getUserBalance(telegramId);
    result ? res.json(result) : res.status(404).json({ error: "Player not found" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:telegramId/level", requireTelegramAuth, async (req, res, next) => {
  try {
    const telegramId = req.params.telegramId;
    if (typeof telegramId !== "string") {
      return res.status(400).json({ error: "Invalid Telegram ID" });
    }
    if (telegramId !== res.locals.telegramId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await arm.getUserLevel(telegramId);
    result ? res.json(result) : res.status(404).json({ error: "Player not found" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/leaderboard", async (req, res, next) => {
  try {
    res.json(await arm.getLeaderboard(Number(req.query.limit ?? 10)));
  } catch (error) {
    next(error);
  }
});

app.get("/api/statistics", async (_req, res, next) => {
  try {
    res.json(await arm.getGameStatistics());
  } catch (error) {
    next(error);
  }
});

app.get("/api/ton/jetton-supply", async (_req, res, next) => {
  try {
    res.json(await ton.getJettonSupply());
  } catch (error) {
    next(error);
  }
});

app.get("/api/ton/transactions/:hash", async (req, res, next) => {
  try {
    res.json(await ton.getTonTransaction(req.params.hash));
  } catch (error) {
    next(error);
  }
});

app.get("/api/stonfi/pool", async (req, res, next) => {
  try {
    res.json(await ton.getPoolInfo(String(req.query.address ?? "")));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/rewards", requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({
      telegramId: z.string().regex(/^\d+$/),
      amount: z.number().int().positive().max(1_000_000_000),
      reason: z.string().min(3).max(300),
      idempotencyKey: z.string().min(8).max(128)
    }).parse(req.body);

    res.status(201).json(
      await arm.addGameReward({ ...body, actor: res.locals.adminActor })
    );
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/ban", requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({
      telegramId: z.string().regex(/^\d+$/),
      reason: z.string().min(3).max(300)
    }).parse(req.body);

    res.json(await arm.banUser({ ...body, actor: res.locals.adminActor }));
  } catch (error) {
    next(error);
  }
});

app.use((
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (res.headersSent) return;

  const parserError = error as {
    type?: string;
    status?: number;
  };

  if (parserError?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  if (parserError?.type === "entity.too.large") {
    res.status(413).json({ error: "Request body too large" });
    return;
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Invalid request",
      ...(config.nodeEnv === "production" ? {} : { details: error.issues })
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  if (/not found/i.test(message)) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  console.error("API internal error");
  res.status(500).json({
    error: config.nodeEnv === "production"
      ? "Internal server error"
      : message
  });
});
