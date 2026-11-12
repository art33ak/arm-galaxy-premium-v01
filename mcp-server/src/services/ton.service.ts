import { config } from "../config.js";

async function getJson(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`External API HTTP ${response.status}`);
  return response.json() as Promise<any>;
}

export async function getJettonSupply() {
  if (!config.armJettonMasterAddress) {
    return { configured: false, message: "Set ARM_JETTON_MASTER_ADDRESS to enable supply lookup." };
  }
  const headers: Record<string, string> = {};
  if (config.tonapiApiKey) headers.Authorization = `Bearer ${config.tonapiApiKey}`;
  const data = await getJson(
    `${config.tonapiBaseUrl}/v2/jettons/${encodeURIComponent(config.armJettonMasterAddress)}`,
    headers
  );
  return {
    configured: true,
    network: config.tonNetwork,
    jettonMasterAddress: config.armJettonMasterAddress,
    totalSupplyRaw: data.total_supply ?? null,
    decimals: data.metadata?.decimals ?? null,
    symbol: data.metadata?.symbol ?? "ARM",
    name: data.metadata?.name ?? null,
    source: "TON API"
  };
}

export async function getTonTransaction(hash: string) {
  if (!/^[a-fA-F0-9]{32,128}$/.test(hash)) throw new Error("Invalid transaction hash");
  const headers: Record<string, string> = {};
  if (config.tonapiApiKey) headers.Authorization = `Bearer ${config.tonapiApiKey}`;
  const data = await getJson(
    `${config.tonapiBaseUrl}/v2/blockchain/transactions/${encodeURIComponent(hash)}`,
    headers
  );
  return {
    hash: data.hash ?? hash,
    account: data.account?.address ?? null,
    lt: data.lt ?? null,
    utime: data.utime ?? null,
    success: data.success ?? null,
    aborted: data.aborted ?? null,
    exitCode: data.compute_phase?.exit_code ?? null,
    source: "TON API"
  };
}

export async function getPoolInfo(poolAddress?: string) {
  const address = poolAddress || config.stonfiPoolAddress;
  if (!address) return { configured: false, message: "Set STONFI_POOL_ADDRESS to enable pool lookup." };
  const data = await getJson(`${config.stonfiBaseUrl}/v1/pools/${encodeURIComponent(address)}`);
  return { configured: true, poolAddress: address, data, source: "STON.fi API" };
}
