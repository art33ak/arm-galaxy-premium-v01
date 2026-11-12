import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../db.js";

const players = db.collection("players");
const adminLogs = db.collection("adminLogs");

function safePlayer(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot) {
  const d = doc.data() ?? {};
  return {
    telegramId: String(d.telegramId ?? doc.id),
    username: d.username ?? null,
    displayName: d.displayName ?? null,
    gamePoints: Number(d.gamePoints ?? 0),
    xp: Number(d.xp ?? 0),
    level: Number(d.level ?? 1),
    energy: Number(d.energy ?? 0),
    energyCap: Number(d.energyCap ?? 0),
    stakedArm: Number(d.stakedArm ?? 0),
    isVip: Boolean(d.isVip),
    isBlocked: Boolean(d.isBlocked)
  };
}

function validateTelegramId(id: string) {
  if (!/^\d+$/.test(id)) throw new Error("Invalid Telegram ID");
}

export async function getUser(telegramId: string) {
  validateTelegramId(telegramId);
  const snap = await players.doc(telegramId).get();
  return snap.exists ? safePlayer(snap) : null;
}

export async function getUserBalance(telegramId: string) {
  const p = await getUser(telegramId);
  return p ? {
    telegramId: p.telegramId,
    gamePoints: p.gamePoints,
    currency: "GAME_POINTS",
    note: "Non-withdrawable in-game points. This is not the on-chain ARM jetton."
  } : null;
}

export async function getUserLevel(telegramId: string) {
  const p = await getUser(telegramId);
  return p ? { telegramId: p.telegramId, level: p.level, xp: p.xp } : null;
}

export async function getLeaderboard(limit = 10) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const snap = await players.orderBy("gamePoints", "desc").limit(safeLimit).get();
  return snap.docs
    .map(safePlayer)
    .filter(p => !p.isBlocked)
    .map((p, index) => ({
      rank: index + 1,
      telegramId: p.telegramId,
      username: p.username,
      displayName: p.displayName,
      gamePoints: p.gamePoints,
      level: p.level,
      xp: p.xp
    }));
}

export async function getGameStatistics() {
  const [playersCount, tasksCount, claimsCount] = await Promise.all([
    players.count().get(),
    db.collection("tasks").count().get(),
    db.collection("taskClaims").count().get()
  ]);
  const snap = await players.get();
  let activePlayers = 0;
  let blockedPlayers = 0;
  let totalGamePoints = 0;
  for (const doc of snap.docs) {
    const p = safePlayer(doc);
    if (p.isBlocked) blockedPlayers++;
    else activePlayers++;
    totalGamePoints += p.gamePoints;
  }
  return {
    totalPlayers: playersCount.data().count,
    activePlayers: activePlayers,
    blockedPlayers,
    totalGamePoints,
    tasks: tasksCount.data().count,
    taskClaims: claimsCount.data().count,
    currency: "GAME_POINTS"
  };
}

/**
 * Adds gamePoints only. It never sends on-chain ARM tokens.
 * Idempotency is recorded in the existing adminLogs collection.
 */
export async function addGameReward(input: {
  telegramId: string; amount: number; reason: string; idempotencyKey: string; actor: string;
}) {
  validateTelegramId(input.telegramId);
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0 || input.amount > 1_000_000_000) {
    throw new Error("Reward amount must be a positive safe integer up to 1,000,000,000");
  }
  if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 128) {
    throw new Error("idempotencyKey must be 8-128 characters");
  }
  const playerRef = players.doc(input.telegramId);
  const logId = "mcp_reward_" + createHash("sha256").update(input.idempotencyKey).digest("hex");
  const logRef = adminLogs.doc(logId);

  return db.runTransaction(async tx => {
    const [playerSnap, priorLog] = await Promise.all([tx.get(playerRef), tx.get(logRef)]);
    if (priorLog.exists) return { applied: false, duplicate: true, logId };
    if (!playerSnap.exists) throw new Error("Player not found");
    const before = Number(playerSnap.get("gamePoints") ?? 0);
    if (playerSnap.get("isBlocked") === true) throw new Error("Player is blocked");
    const after = before + input.amount;
    tx.update(playerRef, {
      gamePoints: FieldValue.increment(input.amount),
      updatedAt: Timestamp.now()
    });
    tx.create(logRef, {
      adminTelegramId: input.actor,
      action: "mcp_add_game_reward",
      targetTelegramId: input.telegramId,
      reason: input.reason,
      before: { gamePoints: before },
      after: { gamePoints: after },
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      createdAt: Timestamp.now()
    });
    return { applied: true, duplicate: false, telegramId: input.telegramId, before, after };
  });
}

export async function banUser(input: { telegramId: string; reason: string; actor: string }) {
  validateTelegramId(input.telegramId);
  const playerRef = players.doc(input.telegramId);
  const logRef = adminLogs.doc();
  return db.runTransaction(async tx => {
    const snap = await tx.get(playerRef);
    if (!snap.exists) throw new Error("Player not found");
    const before = { isBlocked: Boolean(snap.get("isBlocked")) };
    tx.update(playerRef, { isBlocked: true, updatedAt: Timestamp.now() });
    tx.create(logRef, {
      adminTelegramId: input.actor,
      action: "mcp_ban_user",
      targetTelegramId: input.telegramId,
      reason: input.reason,
      before,
      after: { isBlocked: true },
      createdAt: Timestamp.now()
    });
    return { success: true, telegramId: input.telegramId, isBlocked: true, logId: logRef.id };
  });
}
