import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import type { NetworkConfig } from '../types'
import { fetchSupportedNetworksRecord } from '../api/chainList'
import { fetchTokenListForChain, type TokenListEntry } from '../api/tokenList'
import { SUPPORTED_NETWORKS, PUBLIC_READ_ONLY_RPC } from '../constants'
import { getSolanaNetworkConfig, getBitcoinNetworkConfig } from '../constants/networks'

export interface GroupedNetworks {
  mainnetList: [string, NetworkConfig][]
  testnetList: [string, NetworkConfig][]
}

export interface NetworksContextValue {
  /** 支持的链配置（动态 API + Solana，失败时回退到常量） */
  supportedNetworks: Record<string, NetworkConfig>
  /** 按主网/测试网分组的列表，供下拉框使用 */
  getGroupedNetworks: () => GroupedNetworks
  /** 按链的公开 RPC（用于“所有网络”只读查询） */
  getPublicRpc: (chainId: string) => string
  /** 按链获取代币列表（本地 COMMON_TOKENS，带缓存） */
  getTokensForChain: (chainId: string) => Promise<{ address: string; symbol: string; name: string }[]>
  loading: boolean
  error: string | null
}

const NetworksContext = createContext<NetworksContextValue | null>(null)

export function NetworksProvider({ children }: { children: React.ReactNode }) {
  const [supportedNetworks, setSupportedNetworks] = useState<Record<string, NetworkConfig>>(SUPPORTED_NETWORKS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSupportedNetworksRecord(getSolanaNetworkConfig(), getBitcoinNetworkConfig())
      .then((record) => {
        if (!cancelled && Object.keys(record).length > 0) setSupportedNetworks(record)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Failed to load chains')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const getPublicRpc = useCallback((chainId: string): string => {
    const rpc = PUBLIC_READ_ONLY_RPC[chainId] ?? supportedNetworks[chainId]?.rpcUrls?.[0]
    return rpc ? rpc.replace(/\/+$/, '') : ''
  }, [supportedNetworks])

  const getTokensForChain = useCallback(async (chainId: string): Promise<{ address: string; symbol: string; name: string }[]> => {
    const list = await fetchTokenListForChain(chainId)
    return list.map((t: TokenListEntry) => ({ address: t.address, symbol: t.symbol, name: t.name }))
  }, [])

  const getGroupedNetworks = useCallback((): GroupedNetworks => {
    const mainnetList: [string, NetworkConfig][] = []
    const testnetList: [string, NetworkConfig][] = []
    Object.entries(supportedNetworks).forEach(([chainId, network]) => {
      if (network.isTestnet) testnetList.push([chainId, network])
      else mainnetList.push([chainId, network])
    })
    return { mainnetList, testnetList }
  }, [supportedNetworks])

  const value: NetworksContextValue = useMemo(() => ({
    supportedNetworks,
    getGroupedNetworks,
    getPublicRpc,
    getTokensForChain,
    loading,
    error,
  }), [supportedNetworks, getGroupedNetworks, getPublicRpc, getTokensForChain, loading, error])

  return (
    <NetworksContext.Provider value={value}>
      {children}
    </NetworksContext.Provider>
  )
}

export function useNetworks(): NetworksContextValue {
  const ctx = useContext(NetworksContext)
  if (!ctx) throw new Error('useNetworks must be used within NetworksProvider')
  return ctx
}
