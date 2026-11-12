import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

const MAX_AGE_SECONDS = 60 * 60;

export function verifyTelegramInitData(initData: string): string | null {
  try {
    if (!initData || initData.length > 8192) return null;

    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");

    if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
      return null;
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = createHmac("sha256", "WebAppData")
      .update(config.telegramBotToken)
      .digest();

    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest();

    const suppliedHash = Buffer.from(receivedHash, "hex");

    if (
      suppliedHash.length !== calculatedHash.length ||
      !timingSafeEqual(suppliedHash, calculatedHash)
    ) {
      return null;
    }

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);

    if (
      !Number.isSafeInteger(authDate) ||
      authDate <= 0 ||
      authDate > now + 30 ||
      now - authDate > MAX_AGE_SECONDS
    ) {
      return null;
    }

    const userJson = params.get("user");
    if (!userJson) return null;

    const user: unknown = JSON.parse(userJson);

    if (
      typeof user !== "object" ||
      user === null ||
      !("id" in user) ||
      typeof user.id !== "number" ||
      !Number.isSafeInteger(user.id) ||
      user.id <= 0
    ) {
      return null;
    }

    return String(user.id);
  } catch {
    return null;
  }
}

export function requireTelegramAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const initData = req.header("x-telegram-init-data") ?? "";
  const telegramId = verifyTelegramInitData(initData);

  if (!telegramId) {
    return res.status(401).json({ error: "Invalid Telegram authentication" });
  }

  res.locals.telegramId = telegramId;
  next();
}
