import { ethers } from 'ethers'

// 网络配置类型
export interface NetworkConfig {
  chainId: string
  chainName: string
  shortName: string
  /** 下拉框等展示用的网络名称，如 Ethereum、Solana、BNB Chain */
  displayName?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconKey: string
  iconColor: string
  isTestnet: boolean
}

// 钱包提供者类型
export interface WalletProvider {
  name: string
  provider: any
  id: string
}

// 代币信息类型
export interface TokenInfo {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  /** 仅在“所有网络”视图中存在，表示该代币所在链 */
  chainId?: string
  networkName?: string
}

// 账户信息类型
export interface AccountInfo {
  name: string
  address: string
  nativeBalance: string  // 原生代币余额（ETH/MATIC/BNB 等）
  tokens: TokenInfo[]
}

/** 单条链上的余额与代币（用于“所有网络”视图） */
export interface NetworkBalanceInfo {
  chainId: string
  network: NetworkConfig
  nativeBalance: string
  tokens: TokenInfo[]
}

// 钱包状态类型
export interface WalletState {
  account: string
  balance: bigint
  signer: ethers.Signer | null
}

// Window ethereum 扩展
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      providers?: any[]
      on?: (event: string, handler: Function) => void
      removeAllListeners?: () => void
      [key: string]: any
    }
  }
}
