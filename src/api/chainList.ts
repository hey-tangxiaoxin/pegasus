/**
 * 从社区接口 chainid.network 获取 EVM 链列表，与本地 Solana 配置合并
 * @see https://chainid.network/chains.json
 */
import type { NetworkConfig } from '../types'
import { SOLANA_CHAIN_ID } from '../constants'

export interface ChainListEntry {
  name: string
  chain: string
  chainId: number
  shortName: string
  networkId?: number
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpc: string[]
  explorers?: Array<{ name: string; url: string; standard?: string }>
  status?: string
}

const CHAINS_JSON_URL = 'https://chainid.network/chains.json'

/** 按热门程度排序的 Top20 链 ID（主网优先），仅保留此列表内的链；Solana 单独追加不计入 20 */
const TOP_20_CHAIN_IDS: string[] = [
  '0x1',     // Ethereum
  '0x38',    // BNB Chain
  '0x89',    // Polygon
  '0xa4b1',  // Arbitrum One
  '0xa',     // Optimism
  '0x2105',  // Base
  '0xa86a',  // Avalanche C-Chain
  '0xfa',    // Fantom
  '0x144',   // zkSync Era
  '0xe708',  // Linea
  '0x19',    // Cronos
  '0x64',    // Gnosis
  '0x440',   // Metis
  '0xa4ec',  // Celo
  '0x1388',  // Mantle
  '0x82750', // Scroll
  '0x13e31', // Blast
  '0x8ae',   // Kava
  '0x169',   // Manta Pacific
  '0xcc',    // opBNB
]

/** 按热门程度排序的 Top5 测试网，仅保留此列表内的测试网；主网展示完后接测试网 */
const TOP_5_TESTNET_CHAIN_IDS: string[] = [
  '0xaa36a7',  // Ethereum Sepolia
  '0x13882',   // Polygon Amoy
  '0x66eee',   // Arbitrum Sepolia
  '0x14a34',   // Base Sepolia
  '0xaa37dc',  // Optimism Sepolia
]

/** 允许展示的 chainId 集合（Top20 主网 + Top5 测试网），排序顺序：主网顺序 + 测试网顺序 */
const ALLOWED_CHAIN_IDS = [...TOP_20_CHAIN_IDS, ...TOP_5_TESTNET_CHAIN_IDS]

/** chainId (hex) -> iconKey，与 constants/icons 中的 NetworkIcons 一致；未列出的链用 fallback */
const CHAIN_ICON_MAP: Record<string, string> = {
  '0x1': 'ethereum',
  '0x89': 'polygon',
  '0xa4b1': 'arbitrum',
  '0xa': 'optimism',
  '0x38': 'bnb',
  '0x2105': 'base',
  '0xa86a': 'avalanche',
  '0x144': 'zkSync',
  '0xe708': 'linea',
  // Testnets
  '0xaa36a7': 'ethereum',   // Sepolia
  '0x13882': 'polygon',    // Polygon Amoy
  '0x66eee': 'arbitrum',   // Arbitrum Sepolia
  '0xaa37dc': 'optimism',  // Optimism Sepolia
  '0x61': 'bnb',          // BSC Testnet
  '0x14a34': 'base',      // Base Sepolia
  '0xa869': 'avalanche',  // Avalanche Fuji
  '0x12c': 'zkSync',     // zkSync Sepolia
  '0xe705': 'linea',     // Linea Sepolia
}

/** chainId -> 下拉框展示用的网络名称（如 Ethereum、Solana、BNB Chain） */
const CHAIN_DISPLAY_NAME: Record<string, string> = {
  '0x1': 'Ethereum',
  '0x38': 'BNB Chain',
  '0x89': 'Polygon',
  '0xa4b1': 'Arbitrum',
  '0xa': 'Optimism',
  '0x2105': 'Base',
  '0xa86a': 'Avalanche',
  '0xfa': 'Fantom',
  '0x144': 'zkSync Era',
  '0xe708': 'Linea',
  '0x19': 'Cronos',
  '0x64': 'Gnosis',
  '0x440': 'Metis',
  '0xa4ec': 'Celo',
  '0x1388': 'Mantle',
  '0x82750': 'Scroll',
  '0x13e31': 'Blast',
  '0x8ae': 'Kava',
  '0x169': 'Manta Pacific',
  '0xcc': 'opBNB',
  '0xaa36a7': 'Sepolia',
  '0x13882': 'Polygon Amoy',
  '0x66eee': 'Arbitrum Sepolia',
  '0x14a34': 'Base Sepolia',
  '0xaa37dc': 'Optimism Sepolia',
}

/** 已知链的图标主色，用于无专属图标时的 fallback 圆块 */
const CHAIN_ICON_COLOR: Record<string, string> = {
  '0x1': '#627EEA',
  '0x89': '#8247E5',
  '0xa4b1': '#28A0F0',
  '0xa': '#FF0420',
  '0x38': '#F0B90B',
  '0x2105': '#0052FF',
  '0xa86a': '#E84142',
  '0x144': '#1E69FF',
  '0xe708': '#121212',
  '0xaa36a7': '#627EEA',
  '0x13882': '#8247E5',
  '0x66eee': '#28A0F0',
  '0xaa37dc': '#FF0420',
  '0x61': '#F0B90B',
  '0x14a34': '#0052FF',
  '0xa869': '#E84142',
  '0x12c': '#1E69FF',
  '0xe705': '#121212',
}

/** 已知 401/429/500 等问题的官方 RPC 替代（chainId hex -> 可用公开 RPC，无需鉴权） */
const RPC_OVERRIDE: Partial<Record<string, string>> = {
  '0xa4b1': 'https://rpc.ankr.com/arbitrum',
  '0x66eee': 'https://arbitrum-sepolia-rpc.publicnode.com',
  '0xfa': 'https://rpc.ankr.com/fantom',
  '0xa86a': 'https://rpc.ankr.com/avalanche',
  '0xa869': 'https://rpc.ankr.com/avalanche_fuji',
}

function pickPublicRpc(rpcList: string[]): string {
  if (!rpcList?.length) return ''
  const noTemplate = rpcList.find(u => !u.includes('${') && (u.startsWith('http://') || u.startsWith('https://')))
  if (noTemplate) return noTemplate.replace(/\/+$/, '')
  return rpcList[0].replace(/\/+$/, '') || ''
}

function toNetworkConfig(entry: ChainListEntry): NetworkConfig {
  const chainIdHex = `0x${entry.chainId.toString(16)}`
  const rpc = RPC_OVERRIDE[chainIdHex] ?? pickPublicRpc(entry.rpc || [])
  const explorer = entry.explorers?.[0]?.url
  const iconKey = CHAIN_ICON_MAP[chainIdHex] ?? 'generic'
  const iconColor = CHAIN_ICON_COLOR[chainIdHex] ?? '#627EEA'
  const shortName = entry.shortName || entry.chain || entry.name
  return {
    chainId: chainIdHex,
    chainName: entry.name,
    shortName,
    displayName: CHAIN_DISPLAY_NAME[chainIdHex] ?? shortName,
    nativeCurrency: entry.nativeCurrency,
    rpcUrls: rpc ? [rpc] : [],
    blockExplorerUrls: explorer ? [explorer] : undefined,
    iconKey,
    iconColor,
    isTestnet: entry.chainId !== 1 && (entry.networkId !== entry.chainId || entry.name.toLowerCase().includes('test')),
  }
}

let cachedChains: NetworkConfig[] | null = null

/**
 * 获取所有支持的链（EVM 来自 chainid.network + 本地 Solana + Bitcoin），仅内部使用
 */
async function fetchSupportedNetworks(
  solanaConfig: NetworkConfig | null,
  bitcoinConfig: NetworkConfig | null
): Promise<NetworkConfig[]> {
  if (cachedChains) return cachedChains
  try {
    const res = await fetch(CHAINS_JSON_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const list: ChainListEntry[] = await res.json()
    const allowedSet = new Set(ALLOWED_CHAIN_IDS)
    const evm = list
      .filter(
        (c) =>
          c.chainId &&
          c.shortName &&
          c.nativeCurrency?.symbol &&
          c.status !== 'deprecated' &&
          (c.rpc?.length ?? 0) > 0
      )
      .map(toNetworkConfig)
      .filter((n) => n.rpcUrls.length > 0 && allowedSet.has(n.chainId))
      .sort((a, b) => {
        const i = ALLOWED_CHAIN_IDS.indexOf(a.chainId)
        const j = ALLOWED_CHAIN_IDS.indexOf(b.chainId)
        return (i === -1 ? 999 : i) - (j === -1 ? 999 : j)
      })
    const map = new Map<string, NetworkConfig>()
    evm.forEach((n) => map.set(n.chainId, n))
    if (solanaConfig) map.set(SOLANA_CHAIN_ID, solanaConfig)
    if (bitcoinConfig) map.set(bitcoinConfig.chainId, bitcoinConfig)
    cachedChains = Array.from(map.values())
    return cachedChains
  } catch (e) {
    console.warn('Failed to fetch chain list from chainid.network', e)
    const fallback: NetworkConfig[] = []
    if (solanaConfig) fallback.push(solanaConfig)
    if (bitcoinConfig) fallback.push(bitcoinConfig)
    return fallback
  }
}

/**
 * 返回 SUPPORTED_NETWORKS 形态的 Record，便于与现有代码兼容
 */
export async function fetchSupportedNetworksRecord(
  solanaConfig: NetworkConfig | null,
  bitcoinConfig: NetworkConfig | null
): Promise<Record<string, NetworkConfig>> {
  const list = await fetchSupportedNetworks(solanaConfig, bitcoinConfig)
  const record: Record<string, NetworkConfig> = {}
  list.forEach((n) => {
    record[n.chainId] = n
  })
  return record
}
