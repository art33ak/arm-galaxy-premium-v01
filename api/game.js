import crypto from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_START_POINTS = 220;

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

function getInitData(req, body) {
  const header = req.headers["x-telegram-init-data"];
  return (Array.isArray(header) ? header[0] : header) || body.initData || "";
}

function verifyTelegramInitData(initData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not configured in Vercel.");
  if (!initData || typeof initData !== "string") throw new Error("Open ARM Galaxy inside Telegram to sign in.");

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) throw new Error("Telegram authentication data is missing its hash.");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const expected = Buffer.from(expectedHash, "hex");
  const received = Buffer.from(receivedHash, "hex");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new Error("Telegram authentication check failed. Close and reopen the Mini App.");
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > 5 * 60 || authDate > Date.now() / 1000 + 60) {
    throw new Error("Telegram session expired. Close and reopen the Mini App.");
  }
  let user;
  try { user = JSON.parse(params.get("user") || "{}"); } catch { throw new Error("Telegram user data is invalid."); }
  if (!user.id) throw new Error("Telegram user ID is missing.");
  return user;
}

function db() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured in Vercel.");
  if (!getApps().length) {
    let serviceAccount;
    try { serviceAccount = JSON.parse(raw); } catch { throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON."); }
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
  }
  return getFirestore();
}

function isAdmin(userId) {
  const ids = (process.env.ADMIN_TELEGRAM_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return ids.includes(String(userId));
}

function freshPlayer(tgUser) {
  const displayName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || "Explorer";
  return {
    telegramId: String(tgUser.id),
    username: tgUser.username || "",
    displayName,
    photoUrl: tgUser.photo_url || "",
    gamePoints: DEMO_START_POINTS,
    xp: 0,
    level: 1,
    energy: 60,
    energyCap: 100,
    lastEnergyAtMs: Date.now(),
    dailyClaimDate: "",
    dailyStreak: 0,
    stakedArm: 0,
    isVip: false,
    isBlocked: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
}

function energyState(player, now = Date.now()) {
  const cap = Number(player.energyCap || 100);
  const current = Number(player.energy || 0);
  const last = Number(player.lastEnergyAtMs || now);
  const regenerated = Math.floor(Math.max(0, now - last) / 60_000);
  return { energy: Math.min(cap, current + regenerated), energyCap: cap, lastEnergyAtMs: Math.min(now, last + regenerated * 60_000) };
}

function normalizePlayer(data, tgUser) {
  const base = freshPlayer(tgUser);
  const merged = { ...base, ...(data || {}) };
  const energy = energyState(merged);
  return { ...merged, ...energy, level: Math.max(1, Number(merged.level || 1)), gamePoints: Math.max(0, Number(merged.gamePoints || 0)), xp: Math.max(0, Number(merged.xp || 0)) };
}

async function getContext(req, body) {
  const tgUser = verifyTelegramInitData(getInitData(req, body));
  const firestore = db();
  const playerRef = firestore.collection("players").doc(String(tgUser.id));
  let snap = await playerRef.get();
  if (!snap.exists) {
    const initial = freshPlayer(tgUser);
    await playerRef.set(initial);
    snap = await playerRef.get();
  }
  return { tgUser, firestore, playerRef, player: normalizePlayer(snap.data(), tgUser), isAdmin: isAdmin(tgUser.id) };
}

function publicPlayer(player) {
  return {
    telegramId: player.telegramId,
    username: player.username || "",
    displayName: player.displayName || "Explorer",
    photoUrl: player.photoUrl || "",
    gamePoints: player.gamePoints,
    xp: player.xp,
    level: player.level,
    energy: player.energy,
    energyCap: player.energyCap,
    dailyClaimDate: player.dailyClaimDate || "",
    dailyStreak: player.dailyStreak || 0,
    stakedArm: player.stakedArm || 0
  };
}

async function listActiveTasks(firestore) {
  const snap = await firestore.collection("tasks").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((task) => task.active !== false).sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
}

async function ensureAdmin(context, res) {
  if (!context.isAdmin) {
    json(res, 403, { ok: false, error: "Admin access only." });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-telegram-init-data");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    return res.status(204).end();
  }

  const body = parseBody(req);
  const action = String(req.query?.action || body.action || "state");
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return json(res, 503, { ok: false, configured: false, error: "Game backend is not configured yet. Add Telegram and Firebase server variables in Vercel." });
    }
    if (req.method !== "GET" && req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed." });
    const context = await getContext(req, body);
    const { firestore, playerRef, tgUser, player } = context;
    if (player.isBlocked && !context.isAdmin) {
      return json(res, 403, { ok: false, error: "This game account is restricted. Contact ARM GALAXY support." });
    }
    const dateKey = new Date().toISOString().slice(0, 10);

    if (req.method === "GET" && action === "state") {
      const [tasks, playerSnap] = await Promise.all([
        listActiveTasks(firestore),
        firestore.collection("players").orderBy("gamePoints", "desc").limit(20).get()
      ]);
      const leaderboard = playerSnap.docs.map((doc) => {
        const data = doc.data();
        return { telegramId: doc.id, displayName: data.displayName || data.username || "Explorer", level: Math.max(1, Number(data.level || 1)), gamePoints: Math.max(0, Number(data.gamePoints || 0)) };
      });
      return json(res, 200, { ok: true, configured: true, isAdmin: context.isAdmin, player: publicPlayer(player), tasks, leaderboard });
    }

    if (req.method === "GET" && action === "leaderboard") {
      const playerSnap = await firestore.collection("players").orderBy("gamePoints", "desc").limit(50).get();
      const players = playerSnap.docs.map((doc) => {
        const data = doc.data();
        return { telegramId: doc.id, displayName: data.displayName || data.username || "Explorer", level: Math.max(1, Number(data.level || 1)), gamePoints: Math.max(0, Number(data.gamePoints || 0)) };
      });
      return json(res, 200, { ok: true, players });
    }

    if (req.method === "POST" && action === "tap") {
      const count = Math.max(1, Math.min(5, Number(body.count || 1)));
      const updated = await firestore.runTransaction(async (tx) => {
        const snap = await tx.get(playerRef);
        const current = normalizePlayer(snap.data(), tgUser);
        const regen = energyState(current);
        const allowed = Math.min(count, regen.energy);
        if (allowed < 1) throw new Error("ENERGY_EMPTY");
        const points = current.gamePoints + allowed;
        const xp = current.xp + allowed;
        const level = Math.floor(xp / 100) + 1;
        const energyCap = Math.min(250, 100 + (level - 1) * 10);
        const next = { ...current, gamePoints: points, xp, level, energyCap, energy: Math.min(energyCap, regen.energy - allowed), lastEnergyAtMs: regen.lastEnergyAtMs, updatedAt: FieldValue.serverTimestamp() };
        tx.set(playerRef, next, { merge: true });
        return next;
      });
      return json(res, 200, { ok: true, player: publicPlayer(updated) });
    }

    if (req.method === "POST" && action === "daily") {
      const updated = await firestore.runTransaction(async (tx) => {
        const snap = await tx.get(playerRef);
        const current = normalizePlayer(snap.data(), tgUser);
        if (current.dailyClaimDate === dateKey) throw new Error("DAILY_ALREADY_CLAIMED");
        const next = { ...current, gamePoints: current.gamePoints + 50, xp: current.xp + 20, dailyClaimDate: dateKey, dailyStreak: Number(current.dailyStreak || 0) + 1, updatedAt: FieldValue.serverTimestamp() };
        next.level = Math.floor(next.xp / 100) + 1;
        next.energyCap = Math.min(250, 100 + (next.level - 1) * 10);
        tx.set(playerRef, next, { merge: true });
        return next;
      });
      return json(res, 200, { ok: true, message: "Daily reward claimed.", player: publicPlayer(updated) });
    }

    if (req.method === "POST" && action === "submitTask") {
      const taskId = String(body.taskId || "");
      if (!taskId || taskId.length > 150) return json(res, 400, { ok: false, error: "Choose a valid task." });
      const taskRef = firestore.collection("tasks").doc(taskId);
      const taskSnap = await taskRef.get();
      if (!taskSnap.exists || taskSnap.data().active === false) return json(res, 404, { ok: false, error: "Task is no longer active." });
      const claimId = `${tgUser.id}_${taskId}`;
      const claimRef = firestore.collection("taskClaims").doc(claimId);
      await firestore.runTransaction(async (tx) => {
        const oldClaim = await tx.get(claimRef);
        if (oldClaim.exists) throw new Error("TASK_ALREADY_SUBMITTED");
        tx.set(claimRef, { telegramId: String(tgUser.id), displayName: player.displayName, taskId, taskTitle: taskSnap.data().title || "Task", reward: Math.max(0, Number(taskSnap.data().reward || 0)), status: "pending", paidTask: Boolean(taskSnap.data().paidTask), submittedAt: FieldValue.serverTimestamp(), submittedAtMs: Date.now() });
      });
      return json(res, 200, { ok: true, message: "Submitted for admin review. Rewards are added after approval." });
    }

    if (req.method === "GET" && action === "adminSummary") {
      if (!(await ensureAdmin(context, res))) return;
      const [playersSnap, tasksSnap, claimsSnap] = await Promise.all([
        firestore.collection("players").get(), firestore.collection("tasks").get(), firestore.collection("taskClaims").get()
      ]);
      const players = playersSnap.docs.map((doc) => {
        const playerData = normalizePlayer(doc.data(), { id: doc.id });
        return { ...publicPlayer(playerData), telegramId: doc.id, isVip: Boolean(playerData.isVip), isBlocked: Boolean(playerData.isBlocked) };
      }).sort((a, b) => Number(b.gamePoints) - Number(a.gamePoints));
      const claims = claimsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((claim) => claim.status === "pending").slice(0, 40);
      const tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
      return json(res, 200, { ok: true, players, tasks, claims, totalPlayers: playersSnap.size, totalTasks: tasksSnap.size });
    }

    if (req.method === "POST" && action === "adminUpdatePlayer") {
      if (!(await ensureAdmin(context, res))) return;
      const targetId = String(body.telegramId || "").trim();
      const gamePoints = Number(body.gamePoints);
      const xp = Number(body.xp);
      const level = Number(body.level);
      const isVip = Boolean(body.isVip);
      const isBlocked = Boolean(body.isBlocked);
      const reason = String(body.reason || "").trim().slice(0, 240);
      if (!/^\d{4,20}$/.test(targetId)) return json(res, 400, { ok: false, error: "Enter a valid player Telegram ID." });
      if (!reason) return json(res, 400, { ok: false, error: "A reason is required for player account changes." });
      if (![gamePoints, xp, level].every(Number.isFinite) || gamePoints < 0 || gamePoints > 1_000_000_000_000 || xp < 0 || xp > 1_000_000_000_000 || !Number.isInteger(level) || level < 1 || level > 999) {
        return json(res, 400, { ok: false, error: "GP and XP must be non-negative; level must be between 1 and 999." });
      }
      const targetRef = firestore.collection("players").doc(targetId);
      const change = await firestore.runTransaction(async (tx) => {
        const snap = await tx.get(targetRef);
        if (!snap.exists) throw new Error("PLAYER_NOT_FOUND");
        const current = normalizePlayer(snap.data(), { id: targetId });
        const before = { gamePoints: current.gamePoints, xp: current.xp, level: current.level, isVip: Boolean(current.isVip), isBlocked: Boolean(current.isBlocked) };
        const next = { ...current, gamePoints: Math.floor(gamePoints), xp: Math.floor(xp), level, energyCap: Math.min(250, 100 + (level - 1) * 10), isVip, isBlocked, updatedAt: FieldValue.serverTimestamp() };
        tx.set(targetRef, next, { merge: true });
        return { before, after: { gamePoints: next.gamePoints, xp: next.xp, level: next.level, isVip: next.isVip, isBlocked: next.isBlocked }, player: { ...publicPlayer(next), isVip, isBlocked } };
      });
      await firestore.collection("adminLogs").add({ adminTelegramId: String(tgUser.id), action: "player_update", targetTelegramId: targetId, reason, before: change.before, after: change.after, createdAt: FieldValue.serverTimestamp() });
      return json(res, 200, { ok: true, message: "Player account updated.", player: change.player });
    }

    if (req.method === "POST" && action === "adminCreateTask") {
      if (!(await ensureAdmin(context, res))) return;
      const title = String(body.title || "").trim().slice(0, 100);
      const description = String(body.description || "").trim().slice(0, 280);
      const type = body.type === "paid" ? "paid" : (body.type === "daily" ? "daily" : "social");
      const reward = Math.max(0, Math.min(1_000_000, Math.floor(Number(body.reward || 0))));
      const url = String(body.url || "").trim().slice(0, 500);
      const price = Math.max(0, Number(body.price || 0));
      if (!title) return json(res, 400, { ok: false, error: "Task title is required." });
      if (url && !/^https:\/\//i.test(url)) return json(res, 400, { ok: false, error: "Task link must use HTTPS." });
      const taskRef = firestore.collection("tasks").doc();
      const createdAtMs = Date.now();
      const data = { title, description, type, paidTask: type === "paid", reward, url, price, active: true, requiresReview: true, createdBy: String(tgUser.id), createdAt: FieldValue.serverTimestamp(), createdAtMs };
      await taskRef.set(data);
      return json(res, 200, { ok: true, task: { id: taskRef.id, title, description, type, paidTask: type === "paid", reward, url, price, active: true, requiresReview: true, createdAtMs } });
    }

    if (req.method === "POST" && action === "adminBonus") {
      if (!(await ensureAdmin(context, res))) return;
      const targetId = String(body.telegramId || "").trim();
      const amount = Math.floor(Number(body.amount || 0));
      if (!/^\d{4,20}$/.test(targetId) || !Number.isFinite(amount) || amount < 1 || amount > 1_000_000) return json(res, 400, { ok: false, error: "Enter a valid Telegram ID and bonus from 1 to 1,000,000 Galaxy Points." });
      const targetRef = firestore.collection("players").doc(targetId);
      const target = await firestore.runTransaction(async (tx) => {
        const snap = await tx.get(targetRef);
        if (!snap.exists) throw new Error("PLAYER_NOT_FOUND");
        const current = normalizePlayer(snap.data(), { id: targetId });
        const next = { ...current, gamePoints: current.gamePoints + amount, updatedAt: FieldValue.serverTimestamp() };
        tx.set(targetRef, next, { merge: true });
        return publicPlayer(next);
      });
      await firestore.collection("adminLogs").add({ adminTelegramId: String(tgUser.id), action: "bonus", targetTelegramId: targetId, amount, createdAt: FieldValue.serverTimestamp() });
      return json(res, 200, { ok: true, player: target, message: "Bonus added." });
    }

    if (req.method === "POST" && action === "reviewTaskClaim") {
      if (!(await ensureAdmin(context, res))) return;
      const claimId = String(body.claimId || "");
      const approve = Boolean(body.approve);
      if (!claimId) return json(res, 400, { ok: false, error: "Claim ID is required." });
      const claimRef = firestore.collection("taskClaims").doc(claimId);
      await firestore.runTransaction(async (tx) => {
        const claimSnap = await tx.get(claimRef);
        if (!claimSnap.exists || claimSnap.data().status !== "pending") throw new Error("CLAIM_NOT_PENDING");
        const claim = claimSnap.data();
        if (approve) {
          const targetRef = firestore.collection("players").doc(String(claim.telegramId));
          const targetSnap = await tx.get(targetRef);
          if (!targetSnap.exists) throw new Error("PLAYER_NOT_FOUND");
          const target = normalizePlayer(targetSnap.data(), { id: claim.telegramId });
          tx.set(targetRef, { ...target, gamePoints: target.gamePoints + Math.max(0, Number(claim.reward || 0)), xp: target.xp + 10, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        }
        tx.set(claimRef, { status: approve ? "approved" : "rejected", reviewedBy: String(tgUser.id), reviewedAt: FieldValue.serverTimestamp() }, { merge: true });
      });
      return json(res, 200, { ok: true, message: approve ? "Claim approved and game points awarded." : "Claim rejected." });
    }

    if (req.method === "POST" && action === "adminSetTaskActive") {
      if (!(await ensureAdmin(context, res))) return;
      const taskId = String(body.taskId || "");
      const active = Boolean(body.active);
      if (!taskId) return json(res, 400, { ok: false, error: "Task ID is required." });
      await firestore.collection("tasks").doc(taskId).update({ active, updatedAt: FieldValue.serverTimestamp() });
      return json(res, 200, { ok: true, message: active ? "Task enabled." : "Task disabled." });
    }

    return json(res, 400, { ok: false, error: "Unknown action." });
  } catch (error) {
    const message = String(error?.message || "Unexpected server error.");
    const known = {
      ENERGY_EMPTY: [409, "Energy is empty. Wait for regeneration."],
      DAILY_ALREADY_CLAIMED: [409, "Today's reward has already been claimed."],
      TASK_ALREADY_SUBMITTED: [409, "You have already submitted this task."],
      CLAIM_NOT_PENDING: [409, "This claim has already been reviewed."],
      PLAYER_NOT_FOUND: [404, "Player not found."]
    };
    if (known[message]) return json(res, known[message][0], { ok: false, error: known[message][1] });
    if (message.includes("Telegram authentication") || message.includes("Telegram session") || message.includes("Open ARM Galaxy") || message.includes("Telegram user")) return json(res, 401, { ok: false, error: message });
    if (message.includes("Admin access only")) return json(res, 403, { ok: false, error: message });
    console.error("ARM Galaxy API error:", error);
return json(res, 500, {
  ok: false,
  error: "An unexpected server error occurred."
});
  }
}
