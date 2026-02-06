import { AccountCard } from '../../components'
import { SolanaConnectCard } from './ConnectCard'
import { getDisplayAccount, NATIVE_SYMBOL } from './utils'
import type { SolanaAccountState } from './utils'
import type { TokenInfo } from '../../types'

interface SolanaSectionProps {
  account: SolanaAccountState | null
  onConnect: () => void
  onTokenClick?: (token: TokenInfo) => void
}

export function SolanaSection({ account, onConnect, onTokenClick }: SolanaSectionProps) {
  if (!account) {
    return <SolanaConnectCard onConnect={onConnect} />
  }
  const displayAccount = getDisplayAccount(account)[0]
  return (
    <AccountCard
      account={displayAccount}
      nativeSymbol={NATIVE_SYMBOL}
      onTokenClick={onTokenClick}
    />
  )
}
