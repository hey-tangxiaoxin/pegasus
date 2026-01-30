import { ethers } from 'ethers'

// 网络配置类型
export interface NetworkConfig {
  chainId: string
  chainName: string
  shortName: string
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
}

// 账户信息类型
export interface AccountInfo {
  name: string
  address: string
  nativeBalance: string  // 原生代币余额（ETH/MATIC/BNB 等）
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
