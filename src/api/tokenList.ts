/**
 * 按链获取代币列表：仅使用项目内 COMMON_TOKENS，不再请求 1inch（避免 400 Bad Request）
 */
import { COMMON_TOKENS } from '../constants/tokens'

export interface TokenListEntry {
  address: string
  symbol: string
  name: string
  decimals?: number
}

const CACHE: Record<string, TokenListEntry[]> = {}

function fromCommon(chainId: string): TokenListEntry[] {
  const common = COMMON_TOKENS[chainId]
  if (!common?.length) return []
  return common.map((t) => ({
    address: t.address.toLowerCase(),
    symbol: t.symbol,
    name: t.name,
  }))
}

/**
 * 获取指定链的代币列表（来自 COMMON_TOKENS，带内存缓存，无外部请求）
 */
export async function fetchTokenListForChain(chainId: string): Promise<TokenListEntry[]> {
  if (chainId === 'solana' || chainId === 'all') return []
  if (CACHE[chainId]) return CACHE[chainId]
  const list = fromCommon(chainId)
  if (list.length > 0) CACHE[chainId] = list
  return list
}
