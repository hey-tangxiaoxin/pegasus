import { ChainConnectCard } from '../../components'

export function SolanaConnectCard({ onConnect }: { onConnect: () => void }) {
  return (
    <ChainConnectCard
      title="Solana"
      icon="◎"
      description="Connect Phantom or another Solana wallet to view your SOL balance"
      buttonLabel="Connect Solana Wallet"
      onConnect={onConnect}
    />
  )
}
