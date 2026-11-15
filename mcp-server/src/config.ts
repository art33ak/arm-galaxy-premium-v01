import "dotenv/config";
import path from "node:path";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function validateSecret(name: string, value: string): string {
  if (Buffer.byteLength(value, "utf8") < 32) {
    throw new Error(`${name} must be at least 32 bytes`);
  }
  return value;
}

function secureBaseUrl(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${name} must use HTTPS and contain no credentials`);
  }

  return url.toString().replace(/\/+$/, "");
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";
if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error("NODE_ENV must be development, test, or production");
}

const apiBearerToken = validateSecret("API_BEARER_TOKEN", required("API_BEARER_TOKEN"));
const adminMcpBearerToken = validateSecret("ADMIN_MCP_BEARER_TOKEN", required("ADMIN_MCP_BEARER_TOKEN"));
const adminApiKey = validateSecret("ADMIN_API_KEY", required("ADMIN_API_KEY"));
const telegramBotToken = required("TELEGRAM_BOT_TOKEN");

if (apiBearerToken === adminMcpBearerToken) {
  throw new Error("API_BEARER_TOKEN and ADMIN_MCP_BEARER_TOKEN must be different");
}

const adminTelegramIds = (process.env.ADMIN_TELEGRAM_IDS ?? "")
  .split(",")
  .map(v => v.trim())
  .filter(Boolean);

if (adminTelegramIds.some(id => !/^\d+$/.test(id))) {
  throw new Error("ADMIN_TELEGRAM_IDS must contain numeric Telegram IDs");
}

if (nodeEnv === "production" && adminTelegramIds.length === 0) {
  throw new Error("ADMIN_TELEGRAM_IDS is required in production");
}

const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be between 1 and 65535");
}

const tonNetwork = process.env.TON_NETWORK?.trim() || "mainnet";
if (!["mainnet", "testnet"].includes(tonNetwork)) {
  throw new Error("TON_NETWORK must be mainnet or testnet");
}

const armDisplayPriceUsd = Number(process.env.ARM_DISPLAY_PRICE_USD ?? "0.01");
if (!Number.isFinite(armDisplayPriceUsd) || armDisplayPriceUsd <= 0) {
  throw new Error("ARM_DISPLAY_PRICE_USD must be a positive number");
}

export const config = {
  nodeEnv,
  port,
  host: process.env.HOST?.trim() || "127.0.0.1",
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim())
  : "",
firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || "",
  firebaseProjectId: required("FIREBASE_PROJECT_ID"),
  apiBearerToken,
  telegramBotToken,
  adminMcpBearerToken,
  adminApiKey,
  adminTelegramIds,
  tonNetwork,
  armJettonMasterAddress: process.env.ARM_JETTON_MASTER_ADDRESS?.trim() || "",
  armDisplayPriceUsd,
  tonapiBaseUrl: secureBaseUrl("TONAPI_BASE_URL", "https://tonapi.io"),
  tonapiApiKey: process.env.TONAPI_API_KEY?.trim() || "",
  stonfiBaseUrl: secureBaseUrl("STONFI_BASE_URL", "https://api.ston.fi"),
  stonfiPoolAddress: process.env.STONFI_POOL_ADDRESS?.trim() || ""
};
