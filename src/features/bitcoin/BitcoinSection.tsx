import { AccountCard } from '../../components'
import { BitcoinConnectCard } from './ConnectCard'
import { getDisplayAccount, NATIVE_SYMBOL } from './utils'
import type { BitcoinAccountState } from './utils'
import type { TokenInfo } from '../../types'

interface BitcoinSectionProps {
  account: BitcoinAccountState | null
  onConnect: () => void
  onTokenClick?: (token: TokenInfo) => void
}

export function BitcoinSection({ account, onConnect, onTokenClick }: BitcoinSectionProps) {
  if (!account) {
    return <BitcoinConnectCard onConnect={onConnect} />
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
