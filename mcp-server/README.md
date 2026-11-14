# ARM MCP Server — Firebase Edition

This edition connects directly to the existing ARM Galaxy Firestore project.
It uses the existing collections: `players`, `tasks`, `taskClaims`, and `adminLogs`.
It does not use PostgreSQL and does not create a parallel player database.

## Existing player schema mapped

- `players/{telegramId}` — document ID matches `telegramId`.
- `gamePoints` — non-withdrawable game points (not on-chain ARM).
- `xp`, `level`, `energy`, `energyCap`, `stakedArm`, `isVip`, `isBlocked`.
- `tasks`, `taskClaims`, and `adminLogs` are read for game statistics/audit.

## Termux setup

Keep the service-account JSON outside this project at:
`~/.config/arm-mcp/service-account.json`

```bash
cd ~/ARM/arm-mcp-firebase
cp .env.example .env
nano .env
```

Set `FIREBASE_SERVICE_ACCOUNT_PATH` to:
`/data/data/com.termux/files/home/.config/arm-mcp/service-account.json`

Set `FIREBASE_PROJECT_ID=arm-galaxy-premium`, create long random API/admin secrets,
and put your own numeric Telegram ID in `ADMIN_TELEGRAM_IDS`.
Do not share or commit `.env` or the service-account JSON.

Then:

```bash
npm install
npm run check
npm run build
npm start
```

Health check: `http://127.0.0.1:8080/health`
MCP endpoint: `http://127.0.0.1:8080/mcp`

## MCP tools

Read-only token:
- `get_user_balance`
- `get_user_level`
- `get_leaderboard`
- `get_game_statistics`
- `get_total_arm_supply`
- `get_pool_info`
- `get_transaction`

Separate admin token plus trusted gateway-injected `x-admin-telegram-id`:
- `admin_add_reward`
- `admin_ban_user`

Admin reward updates `players/{telegramId}.gamePoints` and writes an audit record
to `adminLogs`. It uses a deterministic idempotency log ID to prevent duplicate rewards.
Admin ban sets `isBlocked=true` and writes an audit record to `adminLogs`.

## Important safety/integration notes

- This service reads/writes existing Firestore documents. Admin reward and ban are real
  mutations. Keep admin tools disabled from ordinary AI sessions and require human approval.
- The `x-admin-telegram-id` header must be injected by a trusted gateway after authenticating
  the human administrator. Do not allow public clients to choose this header.
- The starter does not implement Telegram Mini App `initData` verification. Do not expose
  player-specific REST routes publicly until your existing ARM backend verifies Telegram
  initData and enforces ownership.
- TON functions are read-only. No wallet private keys, signing, token transfers or swaps.
- `gamePoints` is not the real ARM Jetton. Never treat game points as withdrawable tokens.
- First deploy locally and test read tools only. Do not test reward/ban against real players
  until the admin identity gateway and approval flow are in place.
- For public deployment use HTTPS, rate limits, firewall/network restrictions, backups,
  secret rotation and Firestore least-privilege controls.
