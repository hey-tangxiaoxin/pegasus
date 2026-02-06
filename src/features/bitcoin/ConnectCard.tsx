import { ChainConnectCard } from '../../components'

export function BitcoinConnectCard({ onConnect }: { onConnect: () => void }) {
  return (
    <ChainConnectCard
      title="Bitcoin"
      icon="₿"
      description="Connect Unisat or another Bitcoin wallet to view your BTC balance"
      buttonLabel="Connect Bitcoin Wallet"
      onConnect={onConnect}
    />
  )
}
