import { TonConnectUI } from '@tonconnect/ui';
import './style.css';

const root = document.querySelector('#app');
const TG = window.Telegram?.WebApp;
TG?.ready?.();
TG?.expand?.();

const env = import.meta.env;
const ARM_ADDRESS = (env.VITE_ARM_JETTON_ADDRESS || '').trim();
const STONFI_URL = (env.VITE_STONFI_BUY_URL || '').trim();
const DEDUST_URL = (env.VITE_DEDUST_BUY_URL || '').trim();
const STORE_KEY = 'arm-galaxy-premium-demo-v1';

const dict = {
  hy: {
    subtitle: 'ԲԱՑԱՀԱՅՏԻՐ • ԿԱՌՈՒՑԻՐ • ԲԱՑԱՀԱՅՏԻՐ', home: 'Գլխավոր', mining: 'Մայնինգ', staking: 'Սթեյքինգ', tasks: 'Առաջադրանքներ', wallet: 'Դրամապանակ', games: 'Մինի խաղեր', galaxy: 'Գալակտիկա', shop: 'Խանութ', leaderboard: 'Վարկանիշ', friends: 'Հրավերներ', admin: 'Ադմին պանել', settings: 'Կարգավորումներ', whitepaper: 'Սպիտակ գիրք', adminLocked: 'Ադմինի մուտք',
    explorer: 'Հետազոտող', galaxyPoints: 'Գալակտիկայի միավորներ', level: 'Մակարդակ', energy: 'Էներգիա', xp: 'Փորձ', tapToEarn: 'ՍԵՂՄԻՐ ԵՎ ՎԱՍՏԱԿԻՐ', tapHint: 'Յուրաքանչյուր սեղմում՝ +1 խաղային միավոր', daily: 'Ամենօրյա պարգև', claim: 'Ստանալ', claimed: 'Ստացված է', quickAccess: 'Արագ մուտք', yourJourney: 'ՔՈ ՏԻԵԶԵՐԱԿԱՆ ՃԱՆԱՊԱՐՀԸ', continueMission: 'Շարունակիր առաքելությունը', start: 'Սկսել', comingSoon: 'Շուտով', demo: 'ՑՈՒՑԱԴՐԱԿԱՆ ՌԵԺԻՄ', demoText: 'Խաղային տվյալները պահվում են այս սարքում։ Իրական պարգևներ և գործարքներ ակտիվ չեն։', backendReady: 'ՍԵՐՎԵՐԸ ՄԻԱՑՎԱԾ Է',
    yourMiners: 'Քո մայներները', miningPower: 'Մայնինգի հզորություն', perHour: 'միավոր/ժ', upgrade: 'Բարելավել', lockArm: 'Փակել ARM-ը և ստանալ պարգևներ', apy: 'Տարեկան տոկոսադրույք', flexible: 'Ճկուն', days30: '30 օր', days90: '90 օր', stakeArm: 'ՍԹԵՅՔԻՆԳ', stakingNotice: 'Իրական ARM թոքենների սթեյքինգը միացված չէ. այս էկրանը ցուցադրական է, և թոքեններ չեն կողպվում։',
    dailyTasks: 'Ամենօրյա', socialTasks: 'Սոցիալական', paidTasks: 'Վճարովի', allTasks: 'Բոլորը', reward: 'Պարգև', review: 'Ստուգման համար ուղարկել', pending: 'Սպասում է ստուգման', taskNotice: 'Առաջադրանքները հաստատվում են ադմինի կողմից։ Ոչ մի պարգև չի տրվում մինչև ստուգումն ավարտվի։',
    walletTitle: 'Քո ARM դրամապանակը', armTargetPrice: 'ARM-ի նպատակային գին', armPriceNote: 'Նպատակային գին է, ոչ թե հաստատված շուկայական գին։', connectWallet: 'Միացնել TON դրամապանակը', walletConnected: 'Դրամապանակը միացված է', notConfigured: 'Կարգավորումը լրացված չէ', armAddress: 'ARM թոքենի հասցե', buyArm: 'Գնել ARM', noWithdraw: 'Խաղային միավորների դուրսբերում չկա։ Դրամապանակն օգտագործվում է ARM գնելու համար։', buySetup: 'Գնելու հղումը դեռ կարգավորված չէ։ Ավելացրու VITE_STONFI_BUY_URL կամ VITE_DEDUST_BUY_URL։',
    gamesTitle: 'Բոնուսային մինի խաղեր', spin: 'Բախտի անիվ', scratch: 'Քարտի բացում', memory: 'Հիշողություն', play: 'Խաղալ', demoGameNotice: 'Մինի խաղի պարգևները ցուցադրական են, մինչև սերվերի կողմից վավերացումը միացվի։',
    worlds: 'Աշխարհներ', ships: 'Նավեր', boosts: 'Բոնուսներ', owned: 'Քոնն է', buy: 'Գնել', explore: 'Ուսումնասիրել', buildBase: 'Կառուցել բազա', worldNotice: 'Աշխարհներն ու իրերը ձեռք են բերվում խաղային միավորներով։ Գործարքները թոքեններ չեն դուրս բերում։',
    global: 'Ընդհանուր', country: 'Երկիր', player: 'Խաղացող', points: 'Միավորներ', rank: 'Տեղ', referrals: 'Հրավերներ', inviteText: 'Հրավիրիր ընկերներիդ և միասին ուսումնասիրեք Գալակտիկան։', copyLink: 'Պատճենել հղումը', referralsNotice: 'Հղումը կակտիվանա Telegram բոտի օգտանունը կարգավորելուց հետո։',
    adminTitle: 'Ադմինիստրատորի կառավարում', adminOnly: 'Միայն լիազորված ադմինների համար', adminStats: 'Ընդհանուր վիճակագրություն', totalPlayers: 'Խաղացողներ', totalTasks: 'Առաջադրանքներ', pendingClaims: 'Սպասվող ստուգումներ', createTask: 'Ստեղծել առաջադրանք', taskTitle: 'Վերնագիր', taskDescription: 'Նկարագրություն', taskLink: 'Հղում (HTTPS)', taskType: 'Տեսակ', normalTask: 'Սոցիալական', dailyTask: 'Ամենօրյա', paidTask: 'Վճարովի', rewardPoints: 'Պարգև (խաղային միավոր)', price: 'Գին (տեղեկատվական)', create: 'Ստեղծել', bonusTitle: 'Տալ բոնուս', telegramId: 'Խաղացողի Telegram ID', amount: 'Քանակ', sendBonus: 'Ուղարկել բոնուս', reviewClaims: 'Ստուգել առաջադրանքները', approve: 'Հաստատել', reject: 'Մերժել', playerList: 'Խաղացողների ցանկ', allPlayers: 'Բոլոր խաղացողները', searchPlayers: 'Փնտրել անունով կամ Telegram ID-ով', savePlayer: 'Պահպանել', vip: 'VIP', blocked: 'Արգելափակված', pointsBalance: 'GP մնացորդ', reason: 'Փոփոխության պատճառ', adminAccessTitle: 'Ադմինի հասանելիությունը դեռ միացված չէ', adminAccessText: 'Ադմին պանելը բացվում է միայն Telegram Mini App-ում՝ սերվերի կողմից հաստատված ադմինի համար։ Vercel-ում անհրաժեշտ են Telegram Bot Token-ը, Firebase Service Account-ը և քո Telegram ID-ն ADMIN_TELEGRAM_IDS փոփոխականում։', backToGame: 'Վերադառնալ խաղին', activate: 'Ակտիվացնել', deactivate: 'Անջատել',
    success: 'Պատրաստ է', error: 'Սխալ', loading: 'Բեռնվում է…', close: 'Փակել', back: 'Հետ', leaderboardEmpty: 'Վարկանիշը կցուցադրվի, երբ խաղացողները միանան։', welcome: 'Բարի գալուստ ARM GALAXY', chooseLang: 'Լեզու', unavailable: 'Առայժմ հասանելի չէ',
  },
  en: {
    subtitle: 'EXPLORE • BUILD • DISCOVER', home: 'Home', mining: 'Mining', staking: 'Staking', tasks: 'Tasks', wallet: 'Wallet', games: 'Mini Games', galaxy: 'Galaxy', shop: 'Shop', leaderboard: 'Leaderboard', friends: 'Referrals', admin: 'Admin Panel', settings: 'Settings', whitepaper: 'Whitepaper', adminLocked: 'Admin access',
    explorer: 'Explorer', galaxyPoints: 'Galaxy Points', level: 'Level', energy: 'Energy', xp: 'Experience', tapToEarn: 'TAP TO EARN', tapHint: 'Each tap earns +1 in-game point', daily: 'Daily reward', claim: 'Claim', claimed: 'Claimed', quickAccess: 'Quick access', yourJourney: 'YOUR GALACTIC JOURNEY', continueMission: 'Continue your mission', start: 'Start', comingSoon: 'Coming soon', demo: 'DEMO MODE', demoText: 'Game data is saved on this device. Real rewards and transactions are not active.', backendReady: 'BACKEND CONNECTED',
    yourMiners: 'Your miners', miningPower: 'Mining power', perHour: 'points/h', upgrade: 'Upgrade', lockArm: 'Lock ARM and earn rewards', apy: 'Annual yield', flexible: 'Flexible', days30: '30 days', days90: '90 days', stakeArm: 'STAKE ARM', stakingNotice: 'Real ARM-token staking is not connected. This is a preview screen; no tokens are locked.',
    dailyTasks: 'Daily', socialTasks: 'Social', paidTasks: 'Paid', allTasks: 'All tasks', reward: 'Reward', review: 'Submit for review', pending: 'Pending review', taskNotice: 'Tasks are approved by an admin. Rewards are not issued until review is completed.',
    walletTitle: 'Your ARM wallet', armTargetPrice: 'ARM target price', armPriceNote: 'Target reference price, not a verified market price.', connectWallet: 'Connect TON Wallet', walletConnected: 'Wallet connected', notConfigured: 'Not configured', armAddress: 'ARM token address', buyArm: 'Buy ARM', noWithdraw: 'In-game points cannot be withdrawn. The wallet is for buying ARM only.', buySetup: 'Purchase link is not configured yet. Add VITE_STONFI_BUY_URL or VITE_DEDUST_BUY_URL.',
    gamesTitle: 'Bonus mini games', spin: 'Lucky wheel', scratch: 'Scratch card', memory: 'Memory', play: 'Play', demoGameNotice: 'Mini-game rewards are illustrative until server-side validation is enabled.',
    worlds: 'Worlds', ships: 'Ships', boosts: 'Boosts', owned: 'Owned', buy: 'Buy', explore: 'Explore', buildBase: 'Build base', worldNotice: 'Worlds and items are purchased with in-game points. Game points cannot be withdrawn as tokens.',
    global: 'Global', country: 'Country', player: 'Player', points: 'Points', rank: 'Rank', referrals: 'Referrals', inviteText: 'Invite friends and explore the Galaxy together.', copyLink: 'Copy invite link', referralsNotice: 'The invite link becomes active after the Telegram bot username is configured.',
    adminTitle: 'Administrator controls', adminOnly: 'Authorized administrators only', adminStats: 'Overview', totalPlayers: 'Players', totalTasks: 'Tasks', pendingClaims: 'Pending reviews', createTask: 'Create task', taskTitle: 'Title', taskDescription: 'Description', taskLink: 'Link (HTTPS)', taskType: 'Type', normalTask: 'Social', dailyTask: 'Daily', paidTask: 'Paid', rewardPoints: 'Reward (game points)', price: 'Price (informational)', create: 'Create', bonusTitle: 'Send bonus', telegramId: 'Player Telegram ID', amount: 'Amount', sendBonus: 'Send bonus', reviewClaims: 'Review submissions', approve: 'Approve', reject: 'Reject', playerList: 'Players', allPlayers: 'All players', searchPlayers: 'Search by name or Telegram ID', savePlayer: 'Save changes', vip: 'VIP', blocked: 'Blocked', pointsBalance: 'GP balance', reason: 'Reason for change', adminAccessTitle: 'Admin access is not configured yet', adminAccessText: 'The Admin Panel is available only inside the Telegram Mini App for an administrator verified by the server. Configure the Telegram Bot Token, Firebase Service Account, and your Telegram ID in ADMIN_TELEGRAM_IDS in Vercel.', backToGame: 'Return to game', activate: 'Activate', deactivate: 'Deactivate',
    success: 'Done', error: 'Error', loading: 'Loading…', close: 'Close', back: 'Back', leaderboardEmpty: 'The leaderboard will populate as players join.', welcome: 'Welcome to ARM GALAXY', chooseLang: 'Language', unavailable: 'Not available yet',
  },
  ru: {
    subtitle: 'ИССЛЕДУЙ • СТРОЙ • ОТКРЫВАЙ', home: 'Главная', mining: 'Майнинг', staking: 'Стейкинг', tasks: 'Задания', wallet: 'Кошелёк', games: 'Мини-игры', galaxy: 'Галактика', shop: 'Магазин', leaderboard: 'Рейтинг', friends: 'Рефералы', admin: 'Админ-панель', settings: 'Настройки', whitepaper: 'Белая книга', adminLocked: 'Доступ администратора',
    explorer: 'Исследователь', galaxyPoints: 'Очки Галактики', level: 'Уровень', energy: 'Энергия', xp: 'Опыт', tapToEarn: 'НАЖИМАЙ И ЗАРАБАТЫВАЙ', tapHint: 'Каждое нажатие даёт +1 игровой балл', daily: 'Ежедневная награда', claim: 'Получить', claimed: 'Получено', quickAccess: 'Быстрый доступ', yourJourney: 'ТВОЁ ПУТЕШЕСТВИЕ ПО ГАЛАКТИКЕ', continueMission: 'Продолжить миссию', start: 'Начать', comingSoon: 'Скоро', demo: 'ДЕМО-РЕЖИМ', demoText: 'Игровые данные сохраняются на этом устройстве. Реальные награды и транзакции не активны.', backendReady: 'СЕРВЕР ПОДКЛЮЧЁН',
    yourMiners: 'Твои майнеры', miningPower: 'Мощность майнинга', perHour: 'баллов/ч', upgrade: 'Улучшить', lockArm: 'Заблокировать ARM и получать награды', apy: 'Годовая доходность', flexible: 'Гибкий', days30: '30 дней', days90: '90 дней', stakeArm: 'СТЕЙКИНГ ARM', stakingNotice: 'Реальный стейкинг ARM пока не подключён. Это экран-превью; токены не блокируются.',
    dailyTasks: 'Ежедневные', socialTasks: 'Социальные', paidTasks: 'Платные', allTasks: 'Все задания', reward: 'Награда', review: 'Отправить на проверку', pending: 'Ожидает проверки', taskNotice: 'Задания подтверждаются администратором. Награда выдаётся только после проверки.',
    walletTitle: 'Твой ARM-кошелёк', armTargetPrice: 'Целевая цена ARM', armPriceNote: 'Целевая ориентировочная цена, не подтверждённая рыночная цена.', connectWallet: 'Подключить TON Wallet', walletConnected: 'Кошелёк подключён', notConfigured: 'Не настроено', armAddress: 'Адрес токена ARM', buyArm: 'Купить ARM', noWithdraw: 'Игровые баллы нельзя вывести. Кошелёк нужен только для покупки ARM.', buySetup: 'Ссылка для покупки пока не настроена. Добавь VITE_STONFI_BUY_URL или VITE_DEDUST_BUY_URL.',
    gamesTitle: 'Бонусные мини-игры', spin: 'Колесо удачи', scratch: 'Скретч-карта', memory: 'Память', play: 'Играть', demoGameNotice: 'Награды мини-игр демонстрационные, пока не включена серверная проверка.',
    worlds: 'Миры', ships: 'Корабли', boosts: 'Усиления', owned: 'Куплено', buy: 'Купить', explore: 'Исследовать', buildBase: 'Построить базу', worldNotice: 'Миры и предметы покупаются за игровые баллы. Игровые баллы нельзя вывести в виде токенов.',
    global: 'Общий', country: 'Страна', player: 'Игрок', points: 'Баллы', rank: 'Место', referrals: 'Рефералы', inviteText: 'Приглашай друзей и исследуйте Галактику вместе.', copyLink: 'Скопировать ссылку', referralsNotice: 'Ссылка приглашения заработает после настройки имени Telegram-бота.',
    adminTitle: 'Управление администратора', adminOnly: 'Только для авторизованных администраторов', adminStats: 'Обзор', totalPlayers: 'Игроки', totalTasks: 'Задания', pendingClaims: 'Ожидают проверки', createTask: 'Создать задание', taskTitle: 'Название', taskDescription: 'Описание', taskLink: 'Ссылка (HTTPS)', taskType: 'Тип', normalTask: 'Социальное', dailyTask: 'Ежедневное', paidTask: 'Платное', rewardPoints: 'Награда (игровые баллы)', price: 'Цена (справочно)', create: 'Создать', bonusTitle: 'Начислить бонус', telegramId: 'Telegram ID игрока', amount: 'Количество', sendBonus: 'Начислить бонус', reviewClaims: 'Проверка заявок', approve: 'Одобрить', reject: 'Отклонить', playerList: 'Игроки', allPlayers: 'Все игроки', searchPlayers: 'Поиск по имени или Telegram ID', savePlayer: 'Сохранить изменения', vip: 'VIP', blocked: 'Заблокирован', pointsBalance: 'Баланс GP', reason: 'Причина изменения', adminAccessTitle: 'Доступ администратора ещё не настроен', adminAccessText: 'Админ-панель доступна только внутри Telegram Mini App для администратора, подтверждённого сервером. Настройте Telegram Bot Token, Firebase Service Account и свой Telegram ID в ADMIN_TELEGRAM_IDS в Vercel.', backToGame: 'Вернуться в игру', activate: 'Активировать', deactivate: 'Отключить',
    success: 'Готово', error: 'Ошибка', loading: 'Загрузка…', close: 'Закрыть', back: 'Назад', leaderboardEmpty: 'Рейтинг появится после подключения игроков.', welcome: 'Добро пожаловать в ARM GALAXY', chooseLang: 'Язык', unavailable: 'Пока недоступно',
  }
};

const demoTasks = [
  { id: 'demo-daily', title: 'Daily Login', description: 'Claim a small reward once per day.', type: 'daily', reward: 50, url: '', active: true },
  { id: 'demo-channel', title: 'Join ARM Community', description: 'Join the official Telegram community.', type: 'social', reward: 100, url: '', active: true },
  { id: 'demo-friends', title: 'Invite 3 Friends', description: 'Bring new explorers to the Galaxy.', type: 'social', reward: 300, url: '', active: true },
  { id: 'demo-paid', title: 'ARM Supporter · VIP', description: 'Paid task placeholder. Payment verification must be configured before launch.', type: 'paid', paidTask: true, reward: 1000, price: 5, url: '', active: true }
];
const demoPlayers = [
  { displayName: 'cryptoKing', level: 58, gamePoints: 12400000 },
  { displayName: 'ARM_Master', level: 52, gamePoints: 8900000 },
  { displayName: 'GalaxyPro', level: 47, gamePoints: 6200000 },
  { displayName: 'Explorer', level: 12, gamePoints: 220 }
];
const navItems = [
  ['home', '⌂'], ['mining', '⛏'], ['staking', '◈'], ['tasks', '▤'], ['wallet', '◉'], ['games', '✦'], ['galaxy', '✧'], ['shop', '▣'], ['leaderboard', '♜'], ['friends', '♧']
];

function freshDemoState() {
  return { player: { telegramId: '', displayName: TG?.initDataUnsafe?.user?.first_name || 'Explorer', username: TG?.initDataUnsafe?.user?.username || '', gamePoints: 220, xp: 0, level: 1, energy: 60, energyCap: 100, dailyClaimDate: '', dailyStreak: 0, stakedArm: 0 }, tasks: demoTasks, language: 'hy', screen: 'home', isDemo: true, activeWorld: 'NOVA-01' };
}
let saved = null;
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { saved = null; }
let model = { ...freshDemoState(), ...(saved || {}) };
if (model.screen === 'admin' || model.screen === 'adminLocked') model.screen = 'home';
model.player = { ...freshDemoState().player, ...(saved?.player || {}) };
model.tasks = saved?.tasks || demoTasks;
model.language = ['hy', 'en', 'ru'].includes(saved?.language) ? saved.language : 'hy';
let isDemo = true;
let isAdmin = false;
let serverTasks = [];
let serverLeaderboard = [];
let adminData = null;
let tonConnectUI = null;
let walletAddress = '';
let busy = false;
let toastTimer = null;

const t = (key) => dict[model.language]?.[key] || dict.en[key] || key;
const fmt = (value) => new Intl.NumberFormat(model.language === 'hy' ? 'hy-AM' : model.language === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(Number(value || 0));
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function persist() {
  if (isDemo) {
    localStorage.setItem(STORE_KEY, JSON.stringify({ player: model.player, tasks: model.tasks, language: model.language, screen: model.screen, activeWorld: model.activeWorld }));
  } else {
    localStorage.setItem(STORE_KEY, JSON.stringify({ language: model.language, screen: model.screen, activeWorld: model.activeWorld }));
  }
}
function toast(message, type = 'success') {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.className = `toast show ${type}`;
  el.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
}
function setScreen(screen) {
  if (screen === 'admin' && !isAdmin) { model.screen = 'adminLocked'; persist(); render(); return; }
  model.screen = screen;
  persist();
  render();
  if (screen === 'leaderboard' && !isDemo) refreshLeaderboard();
  if (screen === 'admin' && isAdmin && !isDemo) refreshAdminSummary(false);
}
function currentProfileName() { return model.player.displayName || model.player.username || t('explorer'); }
function energyPercent() { return Math.max(0, Math.min(100, (Number(model.player.energy || 0) / Math.max(1, Number(model.player.energyCap || 100))) * 100)); }
function levelProgress() { return Math.max(0, Math.min(100, Number(model.player.xp || 0) % 100)); }
function getTasks() { return isDemo ? model.tasks : serverTasks; }
function getLangOptions() {
  return `<div class="language-switch" aria-label="${esc(t('chooseLang'))}"><button data-lang="hy" class="${model.language === 'hy' ? 'selected' : ''}" aria-label="Հայերեն">🇦🇲 <span>Հայ</span></button><button data-lang="en" class="${model.language === 'en' ? 'selected' : ''}" aria-label="English">🇬🇧 <span>EN</span></button><button data-lang="ru" class="${model.language === 'ru' ? 'selected' : ''}" aria-label="Русский">🇷🇺 <span>РУ</span></button></div>`;
}
function getNavMarkup(mobile = false) {
  const items = mobile ? [['home','⌂'],['mining','⛏'],['tasks','▤'],['galaxy','✧'],['wallet','◉'], ...(isAdmin ? [['admin','⚙']] : [])] : navItems;
  return items.map(([name, icon]) => `<button class="nav-item ${model.screen === name ? 'active' : ''}" data-nav="${name}"><span class="nav-icon">${icon}</span><span>${esc(t(name))}</span>${name === 'tasks' ? '<i class="nav-dot"></i>' : ''}</button>`).join('');
}
function shell(content) {
  return `<div class="app-shell">
    <aside class="sidebar">
      <button class="brand" data-nav="home"><span class="brand-mark"><img src="/assets/arm-logo.jpg" alt="ARM" /></span><span class="brand-copy"><strong>ARM <b>GALAXY</b></strong><small>${esc(t('subtitle'))}</small></span></button>
      <div class="sidebar-label">${esc(t('quickAccess'))}</div>
      <nav class="main-nav">${getNavMarkup(false)}<button class="nav-item ${model.screen === 'admin' || model.screen === 'adminLocked' ? 'active' : ''}" data-nav="admin"><span class="nav-icon">⚙</span><span>${esc(t('admin'))}</span><span class="admin-mark">${isAdmin ? 'ADMIN' : 'LOCKED'}</span></button></nav>
      <div class="sidebar-bottom"><div class="mini-profile"><div class="avatar">${esc((currentProfileName()[0] || 'A').toUpperCase())}</div><div class="profile-copy"><strong>${esc(currentProfileName())}</strong><span>${esc(t('level'))} ${fmt(model.player.level)}</span></div><span class="online-dot"></span></div>${getLangOptions()}<a class="sidebar-doc-link" href="/whitepaper.html">📘 ${esc(t('whitepaper'))}</a><div class="sidebar-foot">© ARM GALAXY · v0.2</div></div>
    </aside>
    <main class="main-content">
      <header class="topbar"><div class="top-heading"><div class="eyebrow"><span class="live-pulse"></span>${isDemo ? esc(t('demo')) : esc(t('backendReady'))}</div><h1>${esc(t(model.screen))}</h1><p>${esc(t('subtitle'))}</p></div><div class="top-actions"><div class="points-chip"><span class="coin-small">✦</span><span><small>${esc(t('galaxyPoints'))}</small><strong>${fmt(model.player.gamePoints)}</strong></span></div><a class="whitepaper-button" href="/whitepaper.html" aria-label="${esc(t('whitepaper'))}">📘 <span>${esc(t('whitepaper'))}</span></a><button class="icon-button" data-nav="settings" title="${esc(t('settings'))}">⚙</button><button class="profile-pill" data-nav="home"><span class="avatar tiny">${esc((currentProfileName()[0] || 'A').toUpperCase())}</span><span>${esc(currentProfileName())}</span><span class="chevron">⌄</span></button></div></header>
      ${isDemo ? `<div class="demo-strip"><span>ⓘ</span><span><strong>${esc(t('demo'))}</strong> — ${esc(t('demoText'))}</span></div>` : ''}
      <section class="view" id="view">${content}</section>
      <footer class="desktop-footer"><span>ARM GALAXY</span><span>Explore · Build · Discover</span><span>NO WITHDRAWALS · GAME POINTS ONLY</span></footer>
    </main>
    <nav class="mobile-nav">${getNavMarkup(true)}</nav>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  </div>`;
}
function panelTitle(eyebrow, title, extra = '') { return `<div class="section-heading"><div><span class="section-eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>${extra}</div>`; }
function statCard(icon, label, value, foot, color = 'gold') { return `<article class="stat-card ${color}"><div class="stat-icon">${icon}</div><div class="stat-copy"><span>${esc(label)}</span><strong>${esc(String(value))}</strong><small>${esc(foot)}</small></div><span class="stat-glow"></span></article>`; }
function renderHome() {
  const player = model.player;
  return `<div class="home-grid">
    <div class="home-main-column">
      <section class="hero-card">
        <div class="hero-stars"></div><div class="hero-copy"><span class="gold-kicker">${esc(t('yourJourney'))}</span><h2>${esc(t('welcome'))}<br/><span>NOVA-01</span></h2><p>${esc(t('continueMission'))}: build your first outpost and discover an ancient signal.</p><div class="hero-level"><div class="level-badge">${fmt(player.level)}</div><div class="level-info"><div><span>${esc(t('level'))} ${fmt(player.level)}</span><b>${fmt(player.xp % 100)} / 100 XP</b></div><div class="progress-track"><i style="width:${levelProgress()}%"></i></div></div></div><button class="gold-button hero-cta" data-nav="galaxy">${esc(t('explore'))} <span>↗</span></button></div>
        <div class="hero-planet"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="planet-glow"></div><img src="/assets/arm-logo.jpg" alt="ARM coin"/><span class="planet-caption">ARM · MADE IN ARMENIA</span></div><div class="hero-bottom-line"></div>
      </section>
      <section class="tap-card">
        <div class="tap-topline"><div><span class="section-eyebrow">${esc(t('galaxyPoints'))}</span><div class="big-balance">${fmt(player.gamePoints)} <span>GP</span></div></div><div class="tap-energy"><span>⚡ ${esc(t('energy'))}</span><b>${fmt(player.energy)} <small>/ ${fmt(player.energyCap)}</small></b><div class="energy-track"><i style="width:${energyPercent()}%"></i></div></div></div>
        <div class="tap-center"><div class="tap-rings"><div class="tap-ring ring-a"></div><div class="tap-ring ring-b"></div><div class="tap-coin"><img src="/assets/arm-logo.jpg" alt="ARM"/></div></div><button class="tap-button" data-action="tap"><span class="tap-icon">✦</span><span>${esc(t('tapToEarn'))}</span><b>+1 GP</b></button><p>${esc(t('tapHint'))}</p></div>
        <div class="tap-footer"><span><i class="tiny-dot"></i> ${esc(t('explorer'))} · ${esc(t('level'))} ${fmt(player.level)}</span><span>⚡ ${Math.max(0, Number(player.energy || 0))} ${esc(t('energy').toLowerCase())}</span></div>
      </section>
      <div class="stats-grid">${statCard('↗', t('xp'), fmt(player.xp), `LEVEL ${fmt(player.level)}`, 'gold')}${statCard('⛏', t('miningPower'), isDemo ? '1.5' : '1.5', `${esc(t('perHour'))}`, 'blue')}${statCard('◈', t('staking'), fmt(player.stakedArm || 0), 'ARM · LOCKED', 'violet')}</div>
    </div>
    <div class="home-side-column">
      <section class="daily-card"><div class="card-heading"><div><span class="section-eyebrow">BONUS DROP</span><h3>${esc(t('daily'))}</h3></div><span class="gift-icon">✧</span></div><div class="daily-reward"><span class="reward-coin">✦</span><div><strong>+50 GP</strong><small>+20 XP · STREAK BONUS</small></div></div><div class="streak-row"><span>DAY ${fmt((player.dailyStreak || 0) + 1)}</span><span class="streak-dots"><i class="done"></i><i class="${(player.dailyStreak || 0) > 0 ? 'done' : ''}"></i><i></i><i></i><i></i><i></i><i></i></span></div><button class="gold-button full-width" data-action="daily" ${player.dailyClaimDate === new Date().toISOString().slice(0,10) ? 'disabled' : ''}>${esc(player.dailyClaimDate === new Date().toISOString().slice(0,10) ? t('claimed') : t('claim'))} <span>→</span></button></section>
      <section class="mission-card"><div class="card-heading"><div><span class="section-eyebrow">FIRST MISSION</span><h3>Ancient Signal</h3></div><span class="mission-icon">⌁</span></div><p>Investigate the mysterious transmission from the mountains of NOVA-01.</p><div class="mission-progress"><div><span>EXPLORATION</span><b>65%</b></div><div class="progress-track"><i style="width:65%"></i></div></div><button class="outline-button full-width" data-nav="galaxy">${esc(t('continueMission'))} <span>↗</span></button></section>
      <section class="quick-card"><div class="card-heading"><div><span class="section-eyebrow">DISCOVER</span><h3>${esc(t('quickAccess'))}</h3></div></div><div class="quick-actions"><button data-nav="tasks"><span class="quick-symbol gold-text">▤</span><span>${esc(t('tasks'))}</span><small>+ GP</small></button><button data-nav="friends"><span class="quick-symbol violet-text">♧</span><span>${esc(t('friends'))}</span><small>+ GP</small></button><button data-nav="games"><span class="quick-symbol blue-text">✦</span><span>${esc(t('games'))}</span><small>PLAY</small></button><button data-nav="shop"><span class="quick-symbol green-text">▣</span><span>${esc(t('shop'))}</span><small>ITEMS</small></button></div></section>
    </div>
  </div>`;
}
function renderMining() {
  const miners = [{ name: 'Basic Miner', rate: '0.1', cost: 100, level: 1, icon: '⛏' }, { name: 'Pro Miner', rate: '1.0', cost: 500, level: 3, icon: '⚒' }, { name: 'Ultra Miner', rate: '5.0', cost: 2000, level: 5, icon: '✦' }];
  return `<div class="screen-stack">${panelTitle('AUTOMATED PROGRESS', t('yourMiners'), `<span class="status-tag">PREVIEW</span>`)}<section class="feature-banner mining-banner"><div><span class="gold-kicker">PASSIVE PROGRESS</span><h2>${esc(t('miningPower'))}<br/><span>1.5 ${esc(t('perHour'))}</span></h2><p>Upgrade your mining fleet to build resources while exploring.</p></div><div class="banner-art mining-art">⛏<span></span></div></section><div class="miner-list">${miners.map((m) => `<article class="miner-row"><div class="miner-avatar">${m.icon}</div><div class="miner-info"><strong>${m.name}</strong><span>${m.rate} ${esc(t('perHour'))} · ${esc(t('level'))} ${m.level}</span></div><div class="miner-cost"><span>✦ ${fmt(m.cost)}</span><button class="small-gold-button" data-action="upgrade-miner" data-cost="${m.cost}">${esc(t('upgrade'))}</button></div></article>`).join('')}</div><p class="notice-line">ⓘ Mining is a game mechanic. Points are not on-chain assets and cannot be withdrawn.</p></div>`;
}
function renderStaking() {
  const plans = [{ name: t('flexible'), rate: '12%', period: 'NO LOCK', id: 'flex' }, { name: t('days30'), rate: '18%', period: '30 DAYS', id: '30' }, { name: t('days90'), rate: '35%', period: '90 DAYS', id: '90' }];
  return `<div class="screen-stack">${panelTitle('ARM REWARDS', t('staking'))}<section class="feature-banner staking-banner"><div><span class="gold-kicker">LOCK · EARN · LEVEL UP</span><h2>${esc(t('lockArm'))}</h2><p>Choose a plan to preview expected reward terms.</p></div><div class="banner-art staking-art">◈<span>ARM</span></div></section><div class="staking-summary"><div><span>${esc(t('staking'))} balance</span><strong>${fmt(model.player.stakedArm || 0)} ARM</strong></div><div><span>${esc(t('apy'))}</span><strong>12%–35%</strong></div></div><div class="plan-grid">${plans.map(p => `<article class="plan-card"><div class="plan-top"><span class="plan-glyph">◈</span><span class="status-tag">${p.period}</span></div><h3>${esc(p.name)}</h3><strong class="apy-value">${p.rate} <small>APY</small></strong><p>Illustrative reward plan. No smart contract is attached yet.</p><button class="outline-button full-width" data-action="stake-preview" data-plan="${p.id}">${esc(t('stakeArm'))}</button></article>`).join('')}</div><div class="notice-card warning"><span>ⓘ</span><p>${esc(t('stakingNotice'))}</p></div></div>`;
}
function taskCategory(task) {
  if (task.paidTask || task.type === 'paid') return 'paid';
  if (task.type === 'daily') return 'daily';
  return 'social';
}
function renderTasks() {
  const tasks = getTasks().filter(task => task.active !== false);
  return `<div class="screen-stack">${panelTitle('EARN BY EXPLORING', t('tasks'), `<span class="count-pill">${tasks.length} ACTIVE</span>`)}<div class="task-tabs"><button class="selected" data-task-filter="all">${esc(t('allTasks'))}</button><button data-task-filter="daily">${esc(t('dailyTasks'))}</button><button data-task-filter="social">${esc(t('socialTasks'))}</button><button data-task-filter="paid">${esc(t('paidTasks'))}</button></div><div class="task-list">${tasks.map(task => { const taskUrl = /^https:\/\//i.test(String(task.url || '')) ? String(task.url) : ''; return `<article class="task-row" data-category="${taskCategory(task)}"><div class="task-symbol ${taskCategory(task)}">${taskCategory(task) === 'daily' ? '✧' : taskCategory(task) === 'paid' ? '♢' : '↗'}</div><div class="task-content"><div class="task-title-line"><h3>${esc(task.title || 'Task')}</h3>${taskCategory(task) === 'paid' ? '<span class="paid-chip">PAID</span>' : taskCategory(task) === 'daily' ? '<span class="daily-chip">DAILY</span>' : ''}</div><p>${esc(task.description || '')}</p><small>${esc(t('reward'))}: <b>+${fmt(task.reward || 0)} GP</b>${task.price ? ` · ${esc(t('price'))}: ${fmt(task.price)} ` : ''}</small></div><div class="task-actions">${taskUrl ? `<a class="task-open" href="${esc(taskUrl)}" target="_blank" rel="noopener noreferrer">Open ↗</a>` : ''}<button class="task-action ${taskCategory(task) === 'paid' ? 'paid-action' : ''}" data-action="submit-task" data-task-id="${esc(task.id)}">${esc(t('review'))} <span>→</span></button></div></article>`; }).join('') || `<div class="empty-state"><span>▤</span><h3>${esc(t('comingSoon'))}</h3><p>${esc(t('unavailable'))}</p></div>`}</div><div class="notice-card"><span>ⓘ</span><p>${esc(t('taskNotice'))}</p></div></div>`;
}
function renderWallet() {
  const walletReady = Boolean(walletAddress);
  const buyConfigured = Boolean(ARM_ADDRESS && (STONFI_URL || DEDUST_URL));
  return `<div class="screen-stack">${panelTitle('TON ECOSYSTEM', t('wallet'))}<section class="wallet-hero"><div class="wallet-hero-copy"><span class="gold-kicker">${esc(t('walletTitle'))}</span><h2>ARM <span>WALLET</span></h2><p>${esc(t('noWithdraw'))}</p><div class="wallet-status ${walletReady ? 'connected' : ''}"><span class="wallet-dot"></span>${walletReady ? `${esc(t('walletConnected'))}: ${esc(walletAddress.slice(0,6))}…${esc(walletAddress.slice(-5))}` : 'TON Connect · READY TO CONNECT'}</div><button class="gold-button" data-action="connect-wallet">${walletReady ? esc(t('walletConnected')) : esc(t('connectWallet'))} <span>↗</span></button></div><div class="wallet-coin"><img src="/assets/arm-logo.jpg" alt="ARM token"/></div></section><div class="wallet-details-grid"><article class="detail-card"><span class="detail-icon gold-text">✦</span><span>${esc(t('galaxyPoints'))}</span><strong>${fmt(model.player.gamePoints)} GP</strong><small>In-game only · no withdrawal</small></article><article class="detail-card"><span class="detail-icon blue-text">◉</span><span>${esc(t('armAddress'))}</span><strong class="address-text">${ARM_ADDRESS ? `${esc(ARM_ADDRESS.slice(0, 8))}…${esc(ARM_ADDRESS.slice(-6))}` : esc(t('notConfigured'))}</strong><small>${ARM_ADDRESS ? 'TON jetton address' : 'Configure VITE_ARM_JETTON_ADDRESS'}</small></article></div><section class="detail-card arm-price-card"><span class="detail-icon gold-text">◆</span><span>${esc(t('armTargetPrice'))}</span><strong>$0.01 USD</strong><small>${esc(t('armPriceNote'))}</small></section><section class="buy-card"><div class="section-heading"><div><span class="section-eyebrow">REAL ARM TOKEN</span><h2>${esc(t('buyArm'))}</h2></div><span class="status-tag">NO WITHDRAWAL</span></div><p>Connect your wallet, then use a configured DEX route to buy ARM. Connecting a wallet does not itself make a purchase.</p><div class="buy-options"><a class="dex-option ${buyConfigured && STONFI_URL ? '' : 'disabled'}" href="${STONFI_URL ? esc(STONFI_URL) : '#'}" ${STONFI_URL ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}><span class="dex-brand stonfi">S</span><span><b>STON.fi</b><small>${STONFI_URL ? 'Open swap route' : esc(t('notConfigured'))}</small></span><span class="arrow">↗</span></a><a class="dex-option ${buyConfigured && DEDUST_URL ? '' : 'disabled'}" href="${DEDUST_URL ? esc(DEDUST_URL) : '#'}" ${DEDUST_URL ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}><span class="dex-brand dedust">D</span><span><b>DeDust</b><small>${DEDUST_URL ? 'Open swap route' : esc(t('notConfigured'))}</small></span><span class="arrow">↗</span></a></div>${!buyConfigured ? `<div class="notice-card warning"><span>ⓘ</span><p>${esc(t('buySetup'))}</p></div>` : ''}</section></div>`;
}
function renderGames() {
  const games = [{ id: 'wheel', title: t('spin'), icon: '◉', tag: 'LUCK' }, { id: 'scratch', title: t('scratch'), icon: '▧', tag: 'BONUS' }, { id: 'memory', title: t('memory'), icon: '▦', tag: 'BRAIN' }, { id: 'rocket', title: 'Rocket Run', icon: '➤', tag: 'ARCADE' }, { id: 'match', title: 'Gem Match', icon: '◇', tag: 'PUZZLE' }, { id: 'signal', title: 'Signal Hunt', icon: '⌁', tag: 'NOVA-01' }];
  return `<div class="screen-stack">${panelTitle('PLAY · DISCOVER · REPEAT', t('gamesTitle'))}<div class="games-grid">${games.map((game, index) => `<article class="game-card game-${index + 1}"><div class="game-card-art"><div class="game-orbit">${game.icon}</div><span class="game-tag">${game.tag}</span></div><div class="game-card-copy"><h3>${esc(game.title)}</h3><p>${index % 2 === 0 ? 'Quick bonus challenge' : 'Test your skills in space'}</p><button class="outline-button full-width" data-action="mini-game" data-game="${game.id}">${esc(t('play'))} <span>↗</span></button></div></article>`).join('')}</div><div class="notice-card warning"><span>ⓘ</span><p>${esc(t('demoGameNotice'))}</p></div></div>`;
}
function renderGalaxy() {
  const worlds = [{ name: 'NOVA-01', title: 'Starting Planet', price: 0, status: 'owned', tone: 'nova', desc: 'Your journey begins here.' }, { name: 'TERRA-02', title: 'Frozen World', price: 100000, status: 'buy', tone: 'terra', desc: 'Ice caves and rare crystal deposits.' }, { name: 'PYRO-03', title: 'Lava World', price: 500000, status: 'buy', tone: 'pyro', desc: 'High risk, high exploration rewards.' }, { name: 'ZEUS-04', title: 'Sky World', price: 1000000, status: 'buy', tone: 'zeus', desc: 'Floating cities above the clouds.' }];
  return `<div class="screen-stack">${panelTitle('EXPLORE NEW WORLDS', t('galaxy'), `<span class="status-tag">NOVA SECTOR</span>`)}<section class="galaxy-banner"><div class="galaxy-nebula"></div><div class="galaxy-banner-copy"><span class="gold-kicker">SECTOR 01 · ANCIENT SIGNAL</span><h2>Explore beyond<br/><span>the horizon.</span></h2><p>Build a base, find ancient signals, and unlock new worlds.</p><div class="explore-stat"><span>EXPLORATION</span><b>65%</b><div class="progress-track"><i style="width:65%"></i></div></div></div><div class="galaxy-orb"><img src="/assets/arm-logo.jpg" alt="ARM"/></div></section><div class="world-list">${worlds.map((world) => `<article class="world-row ${world.tone}"><div class="world-planet"><span>${world.tone === 'nova' ? '✦' : world.tone === 'terra' ? '❄' : world.tone === 'pyro' ? '♨' : '☁'}</span></div><div class="world-info"><span class="world-code">${world.name}</span><h3>${world.title}</h3><p>${world.desc}</p></div><div class="world-action">${world.status === 'owned' ? `<span class="owned-chip">✓ ${esc(t('owned'))}</span>` : `<strong>✦ ${fmt(world.price)} GP</strong><button class="small-gold-button" data-action="buy-world" data-world="${world.name}" data-cost="${world.price}">${esc(t('buy'))}</button>`}</div></article>`).join('')}</div><div class="notice-card"><span>ⓘ</span><p>${esc(t('worldNotice'))}</p></div></div>`;
}
function renderShop() {
  const items = [{ category: 'boosts', title: 'Energy Core', desc: '+20 energy capacity', price: 500, icon: '⚡' }, { category: 'ships', title: 'Scout Ship', desc: 'A fast first exploration ship', price: 3000, icon: '➤' }, { category: 'boosts', title: 'XP Amplifier', desc: 'Progression upgrade preview', price: 1500, icon: '✦' }, { category: 'worlds', title: 'NOVA Base Skin', desc: 'A premium gold base design', price: 800, icon: '⌂' }, { category: 'ships', title: 'Armored Cruiser', desc: 'Advanced galaxy ship', price: 15000, icon: '⬡' }, { category: 'boosts', title: 'Explorer Badge', desc: 'Profile flair', price: 750, icon: '♜' }];
  return `<div class="screen-stack">${panelTitle('UPGRADES & ITEMS', t('shop'))}<div class="shop-tabs"><button class="selected" data-shop-filter="all">ALL</button><button data-shop-filter="worlds">${esc(t('worlds'))}</button><button data-shop-filter="ships">${esc(t('ships'))}</button><button data-shop-filter="boosts">${esc(t('boosts'))}</button></div><div class="shop-grid">${items.map((item, i) => `<article class="shop-item" data-category="${item.category}"><div class="shop-art art-${i + 1}"><span>${item.icon}</span><i></i></div><div class="shop-item-copy"><span class="section-eyebrow">${esc(t(item.category))}</span><h3>${item.title}</h3><p>${item.desc}</p><div class="shop-item-footer"><strong>✦ ${fmt(item.price)} GP</strong><button class="small-gold-button" data-action="buy-item" data-cost="${item.price}" data-item="${esc(item.title)}">${esc(t('buy'))}</button></div></div></article>`).join('')}</div><div class="notice-card"><span>ⓘ</span><p>${esc(t('worldNotice'))}</p></div></div>`;
}
function renderLeaderboard() {
  const players = isDemo ? demoPlayers : (serverLeaderboard.length ? serverLeaderboard : (adminData?.players || []));
  const sorted = [...players].sort((a,b) => Number(b.gamePoints || 0) - Number(a.gamePoints || 0));
  return `<div class="screen-stack">${panelTitle('TOP EXPLORERS', t('leaderboard'), `<span class="count-pill">GLOBAL</span>`)}<section class="leaderboard-hero"><div class="trophy-big">♜</div><div><span class="gold-kicker">LEAD THE GALAXY</span><h2>Legends are made<br/>one tap at a time.</h2><p>Compete for the top spot and unlock recognition.</p></div></section><div class="leaderboard-table"><div class="table-head"><span>#</span><span>${esc(t('player'))}</span><span>${esc(t('level'))}</span><span>${esc(t('points'))}</span></div>${sorted.map((p,i) => `<div class="table-row ${String(p.telegramId || '') === String(model.player.telegramId) ? 'you' : ''}"><span class="rank-cell rank-${i+1}">${String(i+1).padStart(2,'0')}</span><span class="player-cell"><span class="avatar tiny">${esc((p.displayName || p.username || 'P')[0].toUpperCase())}</span><span><strong>${esc(p.displayName || p.username || 'Explorer')}</strong><small>${i === 3 ? 'NOVA-01 explorer' : 'Galaxy explorer'}</small></span></span><span class="level-cell">${fmt(p.level || 1)}</span><strong class="table-points">${fmt(p.gamePoints)}</strong></div>`).join('')}</div><p class="muted-note">${isDemo ? esc(t('leaderboardEmpty')) : 'Player rankings show game points only, not a token balance.'}</p></div>`;
}
function renderFriends() {
  const botName = (env.VITE_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
  const inviteLink = botName && model.player.telegramId ? `https://t.me/${botName}?start=${model.player.telegramId}` : '';
  return `<div class="screen-stack">${panelTitle('BUILD YOUR CREW', t('friends'))}<section class="referral-hero"><div class="referral-graphic"><span class="ref-orbit"></span><span class="ref-person">♧</span><span class="ref-star">✦</span></div><div><span class="gold-kicker">SQUAD REWARDS</span><h2>${esc(t('inviteText'))}</h2><p>Referral bonuses will be awarded only after the bot verifies each invited user.</p></div></section><div class="referral-stats">${statCard('♧', t('referrals'), '0', 'FRIENDS INVITED', 'violet')}${statCard('✦', t('reward'), '0 GP', 'REFERRAL BONUS', 'gold')}</div><section class="invite-card"><div><span class="section-eyebrow">YOUR INVITE LINK</span><strong>${inviteLink ? esc(inviteLink) : esc(t('notConfigured'))}</strong></div><button class="gold-button" data-action="copy-invite" ${inviteLink ? '' : 'disabled'}>${esc(t('copyLink'))} ⧉</button></section><div class="notice-card"><span>ⓘ</span><p>${esc(t('referralsNotice'))} No fake or unverified invite rewards are issued.</p></div></div>`;
}
function renderSettings() {
  return `<div class="screen-stack">${panelTitle('PREFERENCES', t('settings'))}<section class="settings-card"><div class="settings-row"><div><h3>${esc(t('chooseLang'))}</h3><p>Choose the interface language.</p></div>${getLangOptions()}</div><div class="settings-row"><div><h3>Game mode</h3><p>${isDemo ? esc(t('demoText')) : 'Server-connected game profile.'}</p></div><span class="status-tag ${isDemo ? '' : 'green'}">${isDemo ? 'DEMO' : 'LIVE'}</span></div><div class="settings-row"><div><h3>Data and security</h3><p>Balances and admin actions must be checked on the server.</p></div><span class="security-shield">✓</span></div><div class="settings-row"><div><h3>Game economy</h3><p>Galaxy Points are not ARM tokens and cannot be withdrawn.</p></div><span class="status-tag">NO WITHDRAWAL</span></div></section></div>`;
}
function renderAdminLocked() {
  return `<div class="screen-stack">${panelTitle('PRIVATE CONTROL CENTER', t('admin'), '<span class="admin-mark big">LOCKED</span>')}<section class="admin-locked-card"><div class="admin-lock-icon">🔒</div><span class="gold-kicker">SECURE ADMIN ACCESS</span><h2>${esc(t('adminAccessTitle'))}</h2><p>${esc(t('adminAccessText'))}</p><div class="admin-lock-checklist"><div>① ${esc('Բացիր խաղը Telegram Mini App-ի ներսում')}</div><div>② ${esc('Vercel-ում ավելացրու սերվերի գաղտնի փոփոխականները')}</div><div>③ ${esc('ADMIN_TELEGRAM_IDS-ում դիր քո թվային Telegram ID-ն')}</div></div><div class="notice-card warning"><span>⚠</span><p>Մի՛ տեղադրիր Bot Token-ը կամ Firebase Service Account JSON-ը կայքի կոդում, GitHub-ում կամ VITE_ փոփոխականներում։</p></div><button class="gold-button" data-nav="home">${esc(t('backToGame'))} ↗</button></section></div>`;
}

function renderAdmin() {
  if (!isAdmin) return renderHome();
  const summary = adminData || { totalPlayers: 0, totalTasks: serverTasks.length, claims: [], tasks: serverTasks, players: [] };
  return `<div class="screen-stack">${panelTitle('PRIVATE CONTROL CENTER', t('adminTitle'), `<span class="admin-mark big">ADMIN ONLY</span>`)}<div class="admin-stats-grid">${statCard('♧', t('totalPlayers'), fmt(summary.totalPlayers || 0), 'REGISTERED', 'blue')}${statCard('▤', t('totalTasks'), fmt((summary.tasks || []).length), 'CONFIGURED', 'gold')}${statCard('◷', t('pendingClaims'), fmt((summary.claims || []).length), 'NEED REVIEW', 'violet')}</div><div class="admin-columns"><section class="admin-card"><div class="admin-card-heading"><span class="section-eyebrow">CONTENT MANAGEMENT</span><h3>${esc(t('createTask'))}</h3></div><form id="admin-task-form" class="admin-form"><label>${esc(t('taskTitle'))}<input name="title" required maxlength="100" placeholder="e.g. Join ARM channel"/></label><label>${esc(t('taskDescription'))}<textarea name="description" maxlength="280" rows="2" placeholder="What should the player do?"></textarea></label><div class="form-two"><label>${esc(t('taskType'))}<select name="type"><option value="social">${esc(t('normalTask'))}</option><option value="daily">${esc(t('dailyTask'))}</option><option value="paid">${esc(t('paidTask'))}</option></select></label><label>${esc(t('rewardPoints'))}<input name="reward" type="number" min="0" max="1000000" value="100" required/></label></div><label>${esc(t('taskLink'))}<input name="url" type="url" placeholder="https://t.me/…"/></label><label>${esc(t('price'))}<input name="price" type="number" min="0" step="0.01" placeholder="e.g. 5 USDT (informational only)"/></label><button class="gold-button full-width" type="submit">＋ ${esc(t('createTask'))}</button></form><p class="form-footnote">Paid-task payments are not automatically confirmed yet. Every submission stays pending until reviewed.</p></section><section class="admin-card"><div class="admin-card-heading"><span class="section-eyebrow">PLAYER MANAGEMENT</span><h3>${esc(t('bonusTitle'))}</h3></div><form id="admin-bonus-form" class="admin-form"><label>${esc(t('telegramId'))}<input name="telegramId" required inputmode="numeric" placeholder="123456789"/></label><label>${esc(t('amount'))}<input name="amount" type="number" min="1" max="1000000" required value="100"/></label><button class="outline-button full-width" type="submit">＋ ${esc(t('sendBonus'))}</button></form><div class="admin-card-heading mini"><span class="section-eyebrow">PENDING QUEUE</span><h3>${esc(t('reviewClaims'))}</h3></div><div class="claim-list">${(summary.claims || []).map(claim => `<div class="claim-row"><div><strong>${esc(claim.taskTitle || claim.taskId || 'Task')}</strong><small>${esc(claim.displayName || claim.telegramId || '')} · +${fmt(claim.reward || 0)} GP</small></div><div class="claim-actions"><button data-action="review-claim" data-claim-id="${esc(claim.id)}" data-approve="true">✓</button><button data-action="review-claim" data-claim-id="${esc(claim.id)}" data-approve="false">×</button></div></div>`).join('') || `<p class="muted-note">No pending submissions.</p>`}</div></section></div><section class="admin-card"><div class="admin-card-heading"><span class="section-eyebrow">LIVE CONFIGURATION</span><h3>Tasks inventory</h3></div><div class="admin-task-list">${(summary.tasks || []).map(task => `<div class="admin-task-row"><div><strong>${esc(task.title || 'Task')}</strong><small>${esc(task.type || 'social')} · +${fmt(task.reward || 0)} GP ${task.price ? `· Price ${fmt(task.price)}` : ''}</small></div><span class="status-tag ${task.active === false ? '' : 'green'}">${task.active === false ? 'INACTIVE' : 'ACTIVE'}</span><button class="small-outline-button" data-action="toggle-task" data-task-id="${esc(task.id)}" data-active="${task.active === false ? 'true' : 'false'}">${esc(task.active === false ? t('activate') : t('deactivate'))}</button></div>`).join('') || `<p class="muted-note">No tasks have been created yet.</p>`}</div></section><section class="admin-card admin-player-card"><div class="admin-card-heading"><span class="section-eyebrow">PLAYER DATABASE</span><h3>${esc(t('allPlayers'))} · ${fmt((summary.players || []).length)}</h3></div><input class="admin-player-search" id="admin-player-search" type="search" placeholder="${esc(t('searchPlayers'))}" aria-label="${esc(t('searchPlayers'))}"/><div class="admin-player-list">${(summary.players || []).map((player) => `<form class="admin-player-form" data-admin-player-form data-player-id="${esc(player.telegramId)}"><div class="admin-player-identity"><span class="avatar tiny">${esc((player.displayName || player.username || 'P').slice(0,1).toUpperCase())}</span><div><strong>${esc(player.displayName || player.username || 'Explorer')}</strong><small>ID ${esc(player.telegramId)}${player.username ? ` · @${esc(player.username)}` : ''}</small></div></div><label>GP<input name="gamePoints" type="number" min="0" max="1000000000000" step="1" value="${Number(player.gamePoints || 0)}" required/></label><label>XP<input name="xp" type="number" min="0" max="1000000000000" step="1" value="${Number(player.xp || 0)}" required/></label><label>Level<input name="level" type="number" min="1" max="999" step="1" value="${Number(player.level || 1)}" required/></label><label class="admin-check-label"><input name="isVip" type="checkbox" ${player.isVip ? 'checked' : ''}/> ${esc(t('vip'))}</label><label class="admin-check-label"><input name="isBlocked" type="checkbox" ${player.isBlocked ? 'checked' : ''}/> ${esc(t('blocked'))}</label><label class="admin-reason-label">${esc(t('reason'))}<input name="reason" type="text" maxlength="240" placeholder="${esc(t('reason'))}" required/></label><button class="small-gold-button" type="submit">${esc(t('savePlayer'))}</button></form>`).join('') || `<p class="muted-note">No registered players yet. This table is populated from Firebase after Telegram auth is configured.</p>`}</div><p class="form-footnote">Changes are saved on the server and recorded in the admin audit log. This controls game accounts only; it cannot control assets in a player's external wallet.</p></section><div class="notice-card warning"><span>⚠</span><p>Admin access is verified by Telegram ID on the server. Never expose bot tokens or Firebase service-account keys in the browser or in any VITE_ variable.</p></div></div>`;
}
function renderScreen() {
  switch (model.screen) {
    case 'home': return renderHome();
    case 'mining': return renderMining();
    case 'staking': return renderStaking();
    case 'tasks': return renderTasks();
    case 'wallet': return renderWallet();
    case 'games': return renderGames();
    case 'galaxy': return renderGalaxy();
    case 'shop': return renderShop();
    case 'leaderboard': return renderLeaderboard();
    case 'friends': return renderFriends();
    case 'settings': return renderSettings();
    case 'admin': return renderAdmin();
    case 'adminLocked': return renderAdminLocked();
    default: model.screen = 'home'; return renderHome();
  }
}
function render() {
  root.innerHTML = shell(renderScreen());
  bindViewEvents();
  if (TG?.setHeaderColor) { try { TG.setHeaderColor('#090b10'); TG.setBackgroundColor('#090b10'); } catch { /* older Telegram clients */ } }
}

async function requestApi(action, payload = {}, method = 'POST') {
  const initData = TG?.initData || '';
  const url = method === 'GET' ? `/api/game?action=${encodeURIComponent(action)}` : `/api/game?action=${encodeURIComponent(action)}`;
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(initData ? { 'x-telegram-init-data': initData } : {}) },
    ...(method === 'GET' ? {} : { body: JSON.stringify({ ...payload, action }) })
  });
  let data;
  try { data = await response.json(); } catch { throw new Error(`Backend returned HTTP ${response.status}.`); }
  if (!response.ok || !data.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}
function applyServerPlayer(player) {
  model.player = { ...model.player, ...player };
  persist();
}
async function loadServerState() {
  if (!TG?.initData) { render(); return; }
  try {
    const data = await requestApi('state', {}, 'GET');
    if (data.configured && data.player) {
      isDemo = false;
      isAdmin = Boolean(data.isAdmin);
      serverTasks = data.tasks || [];
      serverLeaderboard = data.leaderboard || [];
      applyServerPlayer(data.player);
      render();
      if (isAdmin) refreshAdminSummary(false);
    }
  } catch (error) {
    isDemo = true;
    isAdmin = false;
    render();
    toast(`Demo mode: ${error.message}`, 'error');
  }
}
async function refreshAdminSummary(showError = true) {
  if (!isAdmin || isDemo) return;
  try { adminData = await requestApi('adminSummary', {}, 'GET'); if (model.screen === 'admin') render(); }
  catch (error) { if (showError) toast(error.message, 'error'); }
}
async function refreshLeaderboard() {
  if (isDemo) return;
  try { const data = await requestApi('leaderboard', {}, 'GET'); serverLeaderboard = data.players || []; if (model.screen === 'leaderboard') render(); }
  catch (error) { toast(error.message, 'error'); }
}
function updateDemoPlayer(updater) {
  model.player = { ...model.player, ...updater(model.player) };
  persist(); render();
}
function playTapEffect(button) {
  button?.classList.remove('tap-hit');
  if (button) { void button.offsetWidth; button.classList.add('tap-hit'); }
  const coin = document.querySelector('.tap-coin');
  if (coin) { coin.classList.remove('coin-bounce'); void coin.offsetWidth; coin.classList.add('coin-bounce'); }
}
async function handleTap(button) {
  if (busy) return;
  const energy = Number(model.player.energy || 0);
  if (energy < 1) return toast('Energy depleted. Wait for regeneration.', 'error');
  playTapEffect(button);
  if (isDemo) {
    updateDemoPlayer((p) => ({ gamePoints: Number(p.gamePoints || 0) + 1, xp: Number(p.xp || 0) + 1, level: Math.floor((Number(p.xp || 0) + 1) / 100) + 1, energy: Math.max(0, Number(p.energy || 0) - 1) }));
    return;
  }
  try {
    const data = await requestApi('tap', { count: 1 });
    if (data.player) applyServerPlayer(data.player);
    render();
  } catch (error) { toast(error.message, 'error'); }
}
async function handleDaily() {
  const today = new Date().toISOString().slice(0,10);
  if (isDemo) {
    if (model.player.dailyClaimDate === today) return toast(t('claimed'));
    updateDemoPlayer((p) => ({ gamePoints: Number(p.gamePoints || 0) + 50, xp: Number(p.xp || 0) + 20, level: Math.floor((Number(p.xp || 0) + 20) / 100) + 1, dailyClaimDate: today, dailyStreak: Number(p.dailyStreak || 0) + 1 }));
    return toast(`${t('success')}: +50 GP`);
  }
  try { const data = await requestApi('daily'); applyServerPlayer(data.player); render(); toast(data.message || '+50 GP'); }
  catch (error) { toast(error.message, 'error'); }
}
async function submitTask(taskId) {
  if (isDemo) return toast('Demo only: task verification and rewards are not active.', 'error');
  try { const data = await requestApi('submitTask', { taskId }); toast(data.message || t('pending')); }
  catch (error) { toast(error.message, 'error'); }
}
async function connectWallet() {
  if (walletAddress) { try { await tonConnectUI?.disconnect(); walletAddress = ''; render(); } catch (error) { toast(error.message, 'error'); } return; }
  if (!window.isSecureContext) return toast('TON Connect needs a secure HTTPS page. Use a Vercel preview URL.', 'error');
  try {
    if (!tonConnectUI) {
      tonConnectUI = new TonConnectUI({ manifestUrl: `${window.location.origin}/api/tonconnect-manifest` });
      tonConnectUI.uiOptions = { language: model.language === 'hy' ? 'en' : model.language, uiPreferences: { theme: 'DARK' } };
      tonConnectUI.onStatusChange((wallet) => { walletAddress = wallet?.account?.address || ''; if (model.screen === 'wallet') render(); });
    }
    await tonConnectUI.openModal();
  } catch (error) { toast(`TON Connect: ${error.message || 'could not open wallet selector'}`, 'error'); }
}
function previewOnly(message) { toast(message, 'error'); }
function bindViewEvents() {
  const view = document.querySelector('#view');
  if (!view) return;
  view.querySelectorAll('[data-task-filter]').forEach(btn => btn.addEventListener('click', () => {
    view.querySelectorAll('[data-task-filter]').forEach(b => b.classList.toggle('selected', b === btn));
    const filter = btn.dataset.taskFilter;
    view.querySelectorAll('.task-row').forEach(row => { row.style.display = filter === 'all' || row.dataset.category === filter ? '' : 'none'; });
  }));
  view.querySelectorAll('[data-shop-filter]').forEach(btn => btn.addEventListener('click', () => {
    view.querySelectorAll('[data-shop-filter]').forEach(b => b.classList.toggle('selected', b === btn));
    const filter = btn.dataset.shopFilter;
    view.querySelectorAll('.shop-item').forEach(row => { row.style.display = filter === 'all' || row.dataset.category === filter ? '' : 'none'; });
  }));
  view.querySelector('#admin-task-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (isDemo) return toast('Admin API is not connected. Configure Firebase and Telegram on Vercel.', 'error');
    try { await requestApi('adminCreateTask', { ...data, reward: Number(data.reward), price: Number(data.price || 0) }); toast(t('success')); await refreshAdminSummary(false); render(); }
    catch (error) { toast(error.message, 'error'); }
  });
  view.querySelector('#admin-bonus-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (isDemo) return toast('Admin API is not connected.', 'error');
    try { await requestApi('adminBonus', { telegramId: data.telegramId, amount: Number(data.amount) }); toast(t('success')); event.currentTarget.reset(); await refreshAdminSummary(false); render(); }
    catch (error) { toast(error.message, 'error'); }
  });
  view.querySelector('#admin-player-search')?.addEventListener('input', (event) => {
    const query = event.currentTarget.value.trim().toLowerCase();
    view.querySelectorAll('[data-admin-player-form]').forEach((form) => {
      form.style.display = form.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
  });
  view.querySelectorAll('[data-admin-player-form]').forEach((form) => form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isDemo || !isAdmin) return toast('Admin API is not connected or access is not authorized.', 'error');
    const data = new FormData(form);
    const payload = {
      telegramId: form.dataset.playerId,
      gamePoints: Number(data.get('gamePoints')),
      xp: Number(data.get('xp')),
      level: Number(data.get('level')),
      isVip: form.querySelector('[name="isVip"]').checked,
      isBlocked: form.querySelector('[name="isBlocked"]').checked,
      reason: String(data.get('reason') || '').trim()
    };
    if (!payload.reason) return toast(t('reason'), 'error');
    try {
      await requestApi('adminUpdatePlayer', payload);
      toast(t('success'));
      await refreshAdminSummary(false);
      render();
    } catch (error) { toast(error.message, 'error'); }
  }));
}

root.addEventListener('click', async (event) => {
  const langBtn = event.target.closest('[data-lang]');
  if (langBtn) { model.language = langBtn.dataset.lang; persist(); render(); return; }
  const navBtn = event.target.closest('[data-nav]');
  if (navBtn) { setScreen(navBtn.dataset.nav); return; }
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;
  const { action } = actionBtn.dataset;
  if (action === 'tap') return handleTap(actionBtn);
  if (action === 'daily') return handleDaily();
  if (action === 'submit-task') return submitTask(actionBtn.dataset.taskId);
  if (action === 'connect-wallet') return connectWallet();
  if (action === 'stake-preview') return previewOnly(t('stakingNotice'));
  if (action === 'mini-game') return previewOnly(t('demoGameNotice'));
  if (action === 'upgrade-miner') return previewOnly('Miner upgrades will be connected to the server economy in the next development step.');
  if (action === 'buy-item') return previewOnly('Shop purchases will be validated on the server before any game points are spent.');
  if (action === 'buy-world') return previewOnly('World purchases will be validated and saved by the server in the next development step.');
  if (action === 'copy-invite') {
    const botName = (env.VITE_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
    const link = botName && model.player.telegramId ? `https://t.me/${botName}?start=${model.player.telegramId}` : '';
    if (link) { try { await navigator.clipboard.writeText(link); toast(t('success')); } catch { toast(link); } }
    return;
  }
  if (action === 'review-claim') {
    if (isDemo) return toast('Admin API is not connected.', 'error');
    try { const data = await requestApi('reviewTaskClaim', { claimId: actionBtn.dataset.claimId, approve: actionBtn.dataset.approve === 'true' }); toast(data.message || t('success')); await refreshAdminSummary(false); render(); }
    catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'toggle-task') {
    if (isDemo) return toast('Admin API is not connected.', 'error');
    try { const data = await requestApi('adminSetTaskActive', { taskId: actionBtn.dataset.taskId, active: actionBtn.dataset.active === 'true' }); toast(data.message || t('success')); await refreshAdminSummary(false); render(); }
    catch (error) { toast(error.message, 'error'); }
  }
});

render();
loadServerState();
