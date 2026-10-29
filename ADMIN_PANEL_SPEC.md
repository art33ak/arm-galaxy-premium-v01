# ARM GALAXY — Admin Panel Requirements

**Version:** 0.1  
**Status:** Product specification — planned scope, not all controls are implemented in the starter.  
**Primary owner:** the project owner identified by their numeric Telegram user ID in a server-only Vercel environment variable.

## 1. Non-negotiable access rules

- The Admin Panel is only for the owner by default. Do not reveal admin controls to ordinary players.
- Verify Telegram Mini App `initData` on the server for every privileged request; never trust a client-supplied Telegram ID.
- Check `ADMIN_TELEGRAM_IDS` (or a later database-backed role table protected by owner-only administration) on every admin API action.
- Do not expose bot tokens, Firebase service-account JSON, owner IDs, or other secrets in `VITE_*` browser environment variables.
- A hidden URL is not security. A server-side permission check is mandatory on every operation.
- Log sensitive changes. Require a reason for balance corrections, bans, VIP changes, resets, and manual approvals.
- Never request or store a player's seed phrase/private key. Admin powers apply to the game's account and database, not to ownership of on-chain assets.

## 2. Dashboard navigation

1. **Overview:** total players, active today, new players, pending task claims, active tasks, paid-task statuses, GP issued/removed, VIP users, abuse flags and recent admin actions.
2. **Players:** searchable directory of all registered players is implemented in v0.2; pagination, advanced filters and full player-profile history remain planned.
3. **Tasks:** create/edit/archive tasks; free, daily, social and community tasks; task links, eligibility, dates, rewards, quotas and review rules.
4. **Paid tasks / offers:** configure paid-access offers separately from sponsor-funded reward tasks; display price and asset clearly; track payment-verification status; do not grant access based on an unverified client callback.
5. **Claims / submissions:** review evidence; approve/reject with a reason; prevent duplicate claims; keep a full decision history.
6. **Rewards & campaigns:** daily rewards, streak bonuses, event rewards, referral rewards, codes and limited-time campaigns.
7. **VIP:** manual grant/revoke, expiry, eligibility rules, proof/transaction reference and history.
8. **Galaxy / Worlds:** create/edit worlds, unlock requirements, GP or ARM price (if enabled), item availability, missions, and world status.
9. **Shop / Upgrades:** miners, ships, boosts, upgrades, prices, capacities and release status.
10. **Mining & energy rules:** mining rates, energy cap, regeneration, cooldowns, daily limits and progression values.
11. **Staking configuration:** display/disable the feature and show approved terms only. Do not represent the prototype UI as real staking; do not enable without reviewed contract/integration.
12. **Mini games:** enable/disable games, set limits and reward tables, control event periods and inspect suspicious play. All final rewards must be validated server-side.
13. **Referral system:** reward rules, campaign tags, anti-abuse flags and referral summaries.
14. **Leaderboard:** global/friends/country or seasonal views, season dates, reset controls and integrity review.
15. **Announcements:** multilingual in-game notices, banners and scheduled messages. Telegram broadcasts must respect applicable bot limits and user consent/settings.
16. **Wallet & token links:** show the verified ARM Jetton address, official STON.fi/DeDust URLs and purchase statuses. Read wallet addresses as needed; never expose private keys.
17. **Analytics & exports:** player counts, active users, task completion, retention, GP creation/sinks, shop purchases and anonymized CSV export where appropriate.
18. **Audit log & settings:** full history of admin operations, maintenance mode, allowed owner IDs, feature flags, economy settings and data-retention controls.

## 3. Player directory and controls

The player directory must support server-side pagination, search by Telegram ID/username/display name, sorting and filters for level, VIP, banned/suspended status, registration date, last activity, task status and suspicious activity.

Each player profile should include only necessary information: Telegram ID, username/display name, registration and last activity, GP, XP, level, energy, streak, referral attribution, task claims, VIP status/history, owned worlds/items, verified purchases, and connected public wallet address if relevant. Do not collect unrelated private information.

### Owner actions

**Implemented in v0.2:** list all registered Firestore player records; search locally by player text/Telegram ID; set GP, XP, level, VIP and blocked state through a server-verified action; record before/after values in `adminLogs`; create and activate/deactivate tasks; grant GP bonus; approve/reject task claims. These actions still require configured Telegram and Firebase server variables and must be tested inside Telegram before use.

- Open and inspect a player profile.
- Add GP bonus with a mandatory reason and transaction-ledger entry.
- Remove GP or set an exact GP balance with a clear warning, mandatory reason, before/after values and audit entry.
- Adjust XP/level/energy within validated limits.
- Grant/revoke VIP, set expiry and add a reason/reference.
- Reset progress, energy, daily streak, or selected game data; require explicit confirmation and write a log.
- Temporarily suspend or permanently ban a game account; unban/reactivate; set reason and optional expiry.
- Flag suspected fraud and pause reward eligibility pending review.
- Review, approve or reject task submissions and purchase claims.
- View the player's GP ledger and admin action history.
- Export selected player records when permitted.

“Full control” means full control over the player's in-game account and game data. It does **not** mean the owner can alter a player's real on-chain ARM balance, reverse blockchain transactions, control a connected wallet, or retrieve its private keys.

## 4. Game-point ledger

All GP changes must be server-side and recorded as ledger entries. Fields should include entry ID, player Telegram ID, amount (+/-), balance before/after, reason code, human-readable note, related task/order/event ID, actor (system/admin), timestamp and idempotency key. Avoid silent edits that leave no history. When correcting a mistake, create a compensating entry rather than deleting the original ledger record.

GP is non-withdrawable and distinct from real ARM tokens. Never describe a GP adjustment as a blockchain transfer.

## 5. Task and paid-task workflow

Every task should have: title, localized title/description, category, active status, start/end time, target group, URL, eligibility, required evidence, reward type and amount, quota, repeat policy, review rules and created/updated metadata.

Recommended task types:

- `daily`: repeatable only under a defined day/cooldown rule.
- `social`: join/follow/visit task, with a validation method.
- `sponsored_reward`: a sponsor/admin funds or authorizes a reward for completing a task.
- `paid_access`: the player pays a clearly stated price to unlock an item, feature or entry. Payment must be verified before access is granted.

Do not mix these two meanings: “paid by the player” and “reward paid to the player.” Display who pays whom, the payment asset, exact terms and refund/cancellation rules. Until real payment verification is implemented and tested, mark these tasks as preview/manual-review and do not claim automatic verification.

## 6. Security and reliability

- Authorize every admin API route on the server; test unauthenticated and non-admin attempts.
- Validate and bound numeric inputs; prevent negative/overflow balances and malformed URLs.
- Use Firestore transactions or equivalent atomic operations for balances, claims, unlocks and purchases.
- Make rewards idempotent so retries cannot pay twice.
- Apply per-user rate limits and anti-bot/fraud checks to tap, referrals and mini games.
- Paginate player/task/claim queries; do not fetch the entire database on every page load.
- Log all sensitive operations and failed privilege attempts; avoid writing secrets or unnecessary personal data into logs.
- Use feature flags and maintenance mode to disable faulty reward/payment features immediately.
- Back up and test restoration before launch.

## 7. Implementation status of starter v0.1

The current starter has a basic server-side Telegram `initData` verifier, Firebase Admin setup, tap/daily operations, task creation, task-claim review, player bonus and task activation controls. The starter admin summary currently returns a limited player list and does **not** yet provide the complete directory or all player controls listed above. The following are required before calling the Admin Panel “complete”:

- Full paginated player directory and profile view.
- Search and filters across all players.
- Ban/suspend/unban actions enforced by the gameplay API.
- GP adjustment/removal/set balance with ledger and audit logs.
- XP, level, energy, streak and progression tools.
- VIP management and expiry.
- Reset and manual world/item unlock controls.
- Task editing/archive, paid-access workflow and transaction verification.
- Admin UI pages for all controls, server-side validations and security tests.

## 8. Acceptance checklist

- An ordinary Telegram user cannot open admin data or execute any admin action.
- A forged `telegramId` in request JSON does not grant admin access.
- The owner can find a player beyond the first 30 records.
- Every GP/VIP/level/ban/task approval change writes an audit record.
- Banned users cannot earn new rewards, claim bonuses, or use restricted endpoints.
- Duplicate request/retry cannot award the same reward twice.
- No wallet secret or Firebase private key appears in frontend assets or browser network responses.
- Admin can disable tasks and reward features quickly if abuse or an integration failure occurs.
