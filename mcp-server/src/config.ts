import "dotenv/config";
import path from "node:path";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),
  host: process.env.HOST ?? "127.0.0.1",
  firebaseServiceAccountPath: path.resolve(required("FIREBASE_SERVICE_ACCOUNT_PATH")),
  firebaseProjectId: required("FIREBASE_PROJECT_ID"),
  apiBearerToken: required("API_BEARER_TOKEN"),
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  adminMcpBearerToken: required("ADMIN_MCP_BEARER_TOKEN"),
  adminApiKey: required("ADMIN_API_KEY"),
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",").map(v => v.trim()).filter(Boolean),
  tonNetwork: process.env.TON_NETWORK ?? "mainnet",
  armJettonMasterAddress: process.env.ARM_JETTON_MASTER_ADDRESS ?? "",
  armDisplayPriceUsd: Number(process.env.ARM_DISPLAY_PRICE_USD ?? "0.01"),
  tonapiBaseUrl: process.env.TONAPI_BASE_URL ?? "https://tonapi.io",
  tonapiApiKey: process.env.TONAPI_API_KEY ?? "",
  stonfiBaseUrl: process.env.STONFI_BASE_URL ?? "https://api.ston.fi",
  stonfiPoolAddress: process.env.STONFI_POOL_ADDRESS ?? ""
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be between 1 and 65535");
}
if (config.adminTelegramIds.some(id => !/^\d+$/.test(id))) {
  throw new Error("ADMIN_TELEGRAM_IDS must contain numeric Telegram IDs");
}
