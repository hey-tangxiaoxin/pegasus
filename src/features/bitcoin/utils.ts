import type { AccountInfo } from '../../types'

const CHAIN_NAME = 'Bitcoin'
const NATIVE_SYMBOL = 'BTC'

export interface BitcoinAccountState {
  address: string
  balance: string
}

/** 转为 NetworkSelector / AccountCard 使用的 AccountInfo */
export function getDisplayAccount(account: BitcoinAccountState | null): AccountInfo[] {
  if (!account) return []
  return [{
    name: CHAIN_NAME,
    address: account.address,
    nativeBalance: account.balance,
    tokens: [],
  }]
}

/** 收款地址 */
export function getReceiveAddress(account: BitcoinAccountState | null): string {
  return account?.address ?? ''
}

export { CHAIN_NAME, NATIVE_SYMBOL }
