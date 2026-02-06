import type { AccountInfo } from '../../types'

const CHAIN_NAME = 'Solana'
const NATIVE_SYMBOL = 'SOL'

export interface SolanaAccountState {
  publicKey: string
  balance: string
}

/** 转为 NetworkSelector / AccountCard 使用的 AccountInfo */
export function getDisplayAccount(account: SolanaAccountState | null): AccountInfo[] {
  if (!account) return []
  return [{
    name: CHAIN_NAME,
    address: account.publicKey,
    nativeBalance: account.balance,
    tokens: [],
  }]
}

/** 收款地址 */
export function getReceiveAddress(account: SolanaAccountState | null): string {
  return account?.publicKey ?? ''
}

export { CHAIN_NAME, NATIVE_SYMBOL }
