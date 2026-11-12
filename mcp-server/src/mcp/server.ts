import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import * as arm from "../services/arm.service.js";
import * as ton from "../services/ton.service.js";

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function makeServer(adminActor?: string) {
  console.log("[DEBUG] makeServer START", { adminActor });
  const server = new McpServer({ name: "arm-mcp-firebase", version: "1.1.0" });

  server.tool("get_user_balance", "Read player's non-withdrawable gamePoints (not on-chain ARM).",
    { telegram_id: z.string().regex(/^\d+$/) },
    async ({ telegram_id }) => ({
      content: [{ type: "text", text: JSON.stringify(await arm.getUserBalance(telegram_id) ?? { error: "Player not found" }) }]
    }));

  server.tool("get_user_level", "Read player's level and XP.",
    { telegram_id: z.string().regex(/^\d+$/) },
    async ({ telegram_id }) => ({
      content: [{ type: "text", text: JSON.stringify(await arm.getUserLevel(telegram_id) ?? { error: "Player not found" }) }]
    }));

  server.tool("get_leaderboard", "Read ARM Galaxy leaderboard ordered by gamePoints.",
    { limit: z.number().int().min(1).max(100).default(10) },
    async ({ limit }) => ({
      content: [{ type: "text", text: JSON.stringify(await arm.getLeaderboard(limit)) }]
    }));

  server.tool("get_game_statistics", "Read ARM Galaxy player, task and claim statistics.",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await arm.getGameStatistics()) }]
    }));

  server.tool("get_arm_price", "Read ARM Galaxy target display price in USD. Not a verified market price.",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(ton.getArmDisplayPrice()) }]
    }));

  server.tool("get_total_arm_supply", "Read ARM Jetton supply from TON API.",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await ton.getJettonSupply()) }]
    }));

  server.tool("get_pool_info", "Read STON.fi pool information.",
    { pool_address: z.string().optional() },
    async ({ pool_address }) => ({
      content: [{ type: "text", text: JSON.stringify(await ton.getPoolInfo(pool_address)) }]
    }));

  server.tool("get_transaction", "Look up a TON blockchain transaction by hash.",
    { hash: z.string().min(32).max(128) },
    async ({ hash }) => ({
      content: [{ type: "text", text: JSON.stringify(await ton.getTonTransaction(hash)) }]
    }));

  if (adminActor && config.adminTelegramIds.includes(adminActor)) {
    server.tool("admin_add_reward", "ADMIN ONLY: add in-game gamePoints; does not transfer ARM tokens.",
      {
        telegram_id: z.string().regex(/^\d+$/),
        amount: z.number().int().positive().max(1_000_000_000),
        reason: z.string().min(3).max(300),
        idempotency_key: z.string().min(8).max(128)
      },
      async ({ telegram_id, amount, reason, idempotency_key }) => ({
        content: [{
          type: "text",
          text: JSON.stringify(await arm.addGameReward({
            telegramId: telegram_id, amount, reason, idempotencyKey: idempotency_key, actor: adminActor
          }))
        }]
      }));

    server.tool("admin_ban_user", "ADMIN ONLY: set player's isBlocked flag to true.",
      {
        telegram_id: z.string().regex(/^\d+$/),
        reason: z.string().min(3).max(300)
      },
      async ({ telegram_id, reason }) => ({
        content: [{
          type: "text",
          text: JSON.stringify(await arm.banUser({ telegramId: telegram_id, reason, actor: adminActor }))
        }]
      }));

    console.log("[DEBUG] BEFORE admin_get_logs");
server.tool("admin_get_logs", "ADMIN ONLY: read recent ARM Galaxy admin action logs.",
      {
        limit: z.number().int().min(1).max(100).default(20)
      },
      async ({ limit }) => ({
        content: [{
          type: "text",
          text: JSON.stringify(await arm.getAdminLogs(limit))
        }]
            }));
console.log("[DEBUG] AFTER admin_get_logs");
    console.log("[MCP DEBUG] registered tools:", Object.keys((server as any)._registeredTools));
  }
  return server;
}

export async function handleMcp(req: Request, res: Response) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const adminActor = req.header("x-admin-telegram-id") ?? "";
  const readAllowed = Boolean(token) && same(token, config.apiBearerToken);
  const adminAllowed = Boolean(token) && same(token, config.adminMcpBearerToken)
    && config.adminTelegramIds.includes(adminActor);
  if (!readAllowed && !adminAllowed) return res.status(401).json({ error: "Unauthorized" });

  const server = makeServer(adminAllowed ? adminActor : undefined);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { void transport.close(); void server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP error:", error);
    if (!res.headersSent) res.status(500).json({ error: "MCP request failed" });
  }
}
