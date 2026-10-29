# ARM GALAXY — Premium Dark (starter v0.2)

A mobile-first Telegram Mini App foundation using a clean black / gold design, Armenian-English-Russian interface, Vite, Vercel Functions, Firebase Admin, Telegram Web App authentication, and TON Connect UI.

> **Important:** This is the first working development checkpoint, not a finished production game. On a normal browser or when server settings are missing it runs in a clearly labelled local demo mode. Demo Galaxy Points have no monetary value. Real on-chain ARM purchases, staking smart contracts, paid-task payment verification, shop spending, miner upgrades, and mini-game rewards are not active yet.

## 1. Run locally on Windows

1. Download and extract `arm-galaxy-premium.zip` to a new folder, for example `Desktop\arm-galaxy-premium`.
2. Open Windows PowerShell in that folder.
3. Run:

```powershell
node -v
npm.cmd install
npm.cmd run dev
```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

Do not delete or overwrite your existing ARM Galaxy or ARM Universe 3D folders. This starter is intentionally separate.

## 2. Included in this checkpoint (v0.2)

- Premium black/gold responsive UI, with a supplied ARM coin image.
- Armenian 🇦🇲, English 🇬🇧, Russian 🇷🇺 language selector.
- Home / tap screen with energy, XP, levels and local demo state.
- Mining, staking preview, tasks, TON wallet, mini games, galaxy worlds, shop, leaderboard, referrals and settings screens.
- Server endpoint that validates Telegram Web App `initData` before reading/changing player data.
- Server-side daily reward and tap transactions in Firestore.
- Admin endpoint guarded by a server-side Telegram ID allowlist.
- Admin entry point with a locked state for non-admin/demo sessions; actual controls remain hidden behind server-side Telegram ID verification.
- Admin task creation, task-submission review, player bonus, task active/inactive controls, and an all-player directory with GP/XP/level/VIP/block status edits plus audit logging. This directory loads from Firebase only for an authorized admin.
- TON Connect wallet UI entry point and a dynamic TON Connect manifest endpoint.
- Firestore rules that block direct client reads/writes; trusted server functions use Firebase Admin.

## 3. Configure Vercel server variables

After connecting this as a **new Vercel project** (do not replace the current `arm-galaxy` project unless you intentionally choose to), add these server-only variables under **Project → Settings → Environment Variables**:

- `TELEGRAM_BOT_TOKEN` — token from BotFather. Never expose it in browser code.
- `TELEGRAM_BOT_USERNAME` — bot username without `@` (used for referral links).
- `ADMIN_TELEGRAM_IDS` — your numeric Telegram user ID. For multiple admins, use comma-separated IDs.
- `FIREBASE_SERVICE_ACCOUNT_JSON` — the Firebase service-account JSON for your Firestore project, stored as one JSON string. Keep it server-only.

Public front-end variables (optional):

- `VITE_ARM_JETTON_ADDRESS` — the real ARM Jetton master address on TON. Do not guess this value.
- `VITE_STONFI_BUY_URL` — full STON.fi swap URL for your exact ARM token.
- `VITE_DEDUST_BUY_URL` — full DeDust swap URL for your exact ARM token.
- `VITE_TELEGRAM_BOT_USERNAME` — bot username without `@` for referral links.

Never put service-account keys, bot tokens, admin IDs, or any secret in a `VITE_*` variable. Vite variables are sent to the browser.

## 4. Firebase

1. Use your existing Firebase project `taptoearn3d` if that is still the intended game database.
2. Enable Firestore.
3. Deploy the included `firestore.rules` or copy its rules into Firestore Rules and publish them. The client is intentionally denied direct database access.
4. Create/choose a Firebase service account and store its JSON only in Vercel as `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. The API creates the `players`, `tasks`, `taskClaims`, and `adminLogs` collections as needed.

**Do not reuse an admin token in a browser variable.** The server bypasses client Firestore rules only after Telegram authentication.

## 5. Telegram Mini App

- Configure the Telegram bot's Mini App URL to the deployed HTTPS URL.
- Open the Mini App from Telegram. The backend requires valid Telegram `initData`; typing a numeric Telegram ID in the browser is not accepted as authentication.
- For admin access, the Telegram ID must also be listed in `ADMIN_TELEGRAM_IDS` on the server.

## 6. Security and product scope

- `gamePoints` / Galaxy Points are in-game points only, not real ARM tokens, and cannot be withdrawn.
- TON Connect only connects a wallet; it does not buy tokens by itself. A fully configured DEX URL and verified ARM Jetton address are required to open the correct buy route.
- The staking screen is currently a preview. It does not request or lock real tokens. Real staking requires a reviewed on-chain contract and explicit audit/testing.
- Paid tasks display as paid-task entries but no payment is auto-verified. Submissions stay pending for admin review. A payment webhook / transaction verifier must be implemented before taking real money.
- The shop, miner upgrades, worlds, and mini-games are UI previews until each spend/reward operation is completed server-side with transaction checks.
- Before public launch, add rate limiting, abuse monitoring, Firestore pagination, task URL validation, logging/retention policies, and automated tests.

## 7. Product documentation and owner controls

- `WHITEPAPER_HY.md` — Armenian whitepaper draft in the repository.
- `/whitepaper.html` — formatted public Whitepaper page linked from the game header and sidebar.
- `/WHITEPAPER_HY.md` — downloadable Markdown source of the Whitepaper.
- `ADMIN_PANEL_SPEC.md` — full owner-only admin specification, including all-player management, moderation, balances, VIP, tasks, paid offers, worlds, economy settings, and audit/security rules.
- The v0.2 admin UI/API includes task creation/activation, claim review, bonus grants, and all-player edits for GP, XP, level, VIP and blocked status. Larger items in the specification—pagination, GP ledger, paid-payment verification, world/economy editors, analytics and exports—remain future work. Do not describe the system as production-complete until these and the security tests are finished.
- The owner can manage game accounts and internal Galaxy Points, but cannot control real ARM held in a player's external wallet or change blockchain balances.

## 8. Next implementation milestones

1. Push v0.2 changes to the private GitHub repository and let the separate Vercel project redeploy.
2. Configure Firebase and Telegram server variables, including the owner Telegram ID in `ADMIN_TELEGRAM_IDS`, then test authentication inside Telegram.
3. Test the Whitepaper route and the locked Admin Panel screen in a normal browser.
4. Connect the official ARM Jetton buy URLs and test TonConnect on HTTPS.
5. Finish server-validated shop/world/miner purchase transactions and paid-task verification.
6. Test security rules, admin-only access, edge cases, and mobile Telegram behaviour before launch.
