import { useCallback, useState, useEffect, useMemo } from 'react'
import { Form, Spin } from 'antd'
import './styles/global.less'
import styles from './App.module.less'

// Hooks
import { useWallet, useTransaction } from './hooks'

// Components
import {
  Header,
  WelcomeSection,
  AccountCard,
  WalletModal,
  NetworkSelector,
  ActionButtons,
  BuyModal,
  SwapModal,
  SendModal,
  ReceiveModal,
  ContentLoadingPlaceholder,
} from './components'
import type { ActionType } from './components'
import { ALL_NETWORKS_CHAIN_ID, SOLANA_CHAIN_ID, BITCOIN_CHAIN_ID } from './constants'
import { SolanaSection, getDisplayAccount as getSolanaDisplayAccount, getReceiveAddress as getSolanaReceiveAddress } from './features/solana'
import { BitcoinSection, getDisplayAccount as getBitcoinDisplayAccount, getReceiveAddress as getBitcoinReceiveAddress } from './features/bitcoin'

function App() {
  const [form] = Form.useForm()
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0)
  
  // Modal states
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  
  const {
    walletInfo,
    accountsInfo,
    loading,
    loadingAllNetworks,
    isWalletModalOpen,
    availableWallets,
    currentChainId,
    displayChainId,
    isNetworkSwitching,
    nativeSymbol,
    allNetworksByAccount,
    connectedWalletId,
    connectingWalletId,
    ethersProvider,
    setIsWalletModalOpen,
    handleConnectWallet,
    connectToWallet,
    disconnectWallet,
    handleNetworkSwitch,
    fetchAllAccounts,
    fetchAllNetworksForAllAccounts,
    fetchTokensForAccount,
    solanaAccount,
    connectSolanaWallet,
    bitcoinAccount,
    connectBitcoinWallet,
  } = useWallet()

  // Memoize onSuccess callback to avoid unnecessary re-renders
  const handleTransactionSuccess = useCallback(() => {
    if (ethersProvider) {
      fetchAllAccounts(ethersProvider)
    }
  }, [ethersProvider, fetchAllAccounts])

  const { handleSendTransaction } = useTransaction({
    account: walletInfo.account,
    signer: walletInfo.signer,
    ethersProvider,
    form,
    onSuccess: handleTransactionSuccess,
  })

  // Memoize token click handler - open send modal with token
  const handleTokenClick = useCallback((token: { address: string }) => {
    form.setFieldsValue({ tokenAddress: token.address })
    setIsSendModalOpen(true)
  }, [form])

  // Memoize modal close handler
  const handleCloseModal = useCallback(() => {
    setIsWalletModalOpen(false)
  }, [setIsWalletModalOpen])

  // Handle action button clicks
  const handleAction = useCallback((action: ActionType) => {
    switch (action) {
      case 'buy':
        setIsBuyModalOpen(true)
        break
      case 'swap':
        setIsSwapModalOpen(true)
        break
      case 'send':
        setIsSendModalOpen(true)
        break
      case 'receive':
        setIsReceiveModalOpen(true)
        break
    }
  }, [])

  // Memoize account change handler
  const handleAccountChange = useCallback((index: number) => {
    setSelectedAccountIndex(index)
  }, [])

  // Get the currently selected account (must be before useEffects that depend on it)
  const selectedAccount = accountsInfo[selectedAccountIndex]

  const hasAnyWallet = !!(walletInfo.account || solanaAccount || bitcoinAccount)

  const selectorAccounts = useMemo(() => {
    if (displayChainId === SOLANA_CHAIN_ID) return getSolanaDisplayAccount(solanaAccount)
    if (displayChainId === BITCOIN_CHAIN_ID) return getBitcoinDisplayAccount(bitcoinAccount)
    return accountsInfo
  }, [displayChainId, solanaAccount, bitcoinAccount, accountsInfo])

  const selectorAccountIndex = displayChainId === SOLANA_CHAIN_ID || displayChainId === BITCOIN_CHAIN_ID ? 0 : selectedAccountIndex

  const connectedWalletName = useMemo(() => {
    if (connectedWalletId) {
      const w = availableWallets.find(aw => aw.id === connectedWalletId)
      if (w) return w.name
    }
    const parts: string[] = []
    if (solanaAccount) parts.push('Solana')
    if (bitcoinAccount) parts.push('Bitcoin')
    return parts.length ? parts.join(', ') : ''
  }, [connectedWalletId, availableWallets, solanaAccount, bitcoinAccount])

  const receiveAddress = displayChainId === SOLANA_CHAIN_ID
    ? getSolanaReceiveAddress(solanaAccount)
    : displayChainId === BITCOIN_CHAIN_ID
      ? getBitcoinReceiveAddress(bitcoinAccount)
      : (selectedAccount?.address ?? '')

  const receiveChainId = displayChainId === SOLANA_CHAIN_ID
    ? SOLANA_CHAIN_ID
    : displayChainId === BITCOIN_CHAIN_ID
      ? BITCOIN_CHAIN_ID
      : currentChainId

  // Reset selected account index when accounts change
  useEffect(() => {
    if (selectedAccountIndex >= accountsInfo.length && accountsInfo.length > 0) {
      setSelectedAccountIndex(0)
    }
  }, [accountsInfo.length, selectedAccountIndex])

  // When "All Networks" is selected, fetch only current account's balances across all networks
  useEffect(() => {
    if (displayChainId !== ALL_NETWORKS_CHAIN_ID) return
    if (accountsInfo.length > 0 || solanaAccount || bitcoinAccount) {
      fetchAllNetworksForAllAccounts(selectedAccountIndex).catch(() => {})
    }
  }, [displayChainId, accountsInfo.length, selectedAccountIndex, solanaAccount, bitcoinAccount, fetchAllNetworksForAllAccounts])

  // When selected account changes (EVM single-chain view), load tokens for that account only
  useEffect(() => {
    if (displayChainId === SOLANA_CHAIN_ID || displayChainId === BITCOIN_CHAIN_ID || displayChainId === ALL_NETWORKS_CHAIN_ID) return
    if (accountsInfo.length === 0 || selectedAccountIndex >= accountsInfo.length) return
    fetchTokensForAccount(selectedAccountIndex)
  }, [displayChainId, selectedAccountIndex, accountsInfo.length, fetchTokensForAccount])

  return (
    <div className={styles.appContainer}>
      <Header
        account={walletInfo.account || solanaAccount?.publicKey || bitcoinAccount?.address || ''}
        onConnect={handleConnectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          {!hasAnyWallet ? (
            <div className={styles.contentBlock}>
              <WelcomeSection onConnect={handleConnectWallet} />
            </div>
          ) : (
            <div className={styles.contentBlock}>
              <div className={loading || loadingAllNetworks ? styles.accountAreaLoading : undefined}>
                <NetworkSelector
                  currentChainId={currentChainId}
                  displayChainId={displayChainId}
                  isNetworkSwitching={isNetworkSwitching}
                  isDisabled={!hasAnyWallet || loading}
                  onNetworkSwitch={handleNetworkSwitch}
                  accounts={selectorAccounts}
                  selectedAccountIndex={selectorAccountIndex}
                  onAccountChange={handleAccountChange}
                  connectedWalletName={connectedWalletName}
                />

                <ActionButtons onAction={handleAction} disabled={loading || loadingAllNetworks} />

                <Spin spinning={loading && displayChainId !== ALL_NETWORKS_CHAIN_ID} tip={loading ? 'Loading account...' : undefined}>
                  {displayChainId === SOLANA_CHAIN_ID ? (
                    <SolanaSection
                      account={solanaAccount}
                      onConnect={connectSolanaWallet}
                      onTokenClick={handleTokenClick}
                    />
                  ) : displayChainId === BITCOIN_CHAIN_ID ? (
                    <BitcoinSection
                      account={bitcoinAccount}
                      onConnect={connectBitcoinWallet}
                      onTokenClick={handleTokenClick}
                    />
                  ) : displayChainId === ALL_NETWORKS_CHAIN_ID ? (
                    (loadingAllNetworks || !allNetworksByAccount?.length) ? (
                      <ContentLoadingPlaceholder message="Loading all networks..." showSkeleton />
                    ) : (
                      allNetworksByAccount!.map(({ account, networkBalances }) => (
                        <AccountCard
                          key={account.address}
                          account={account}
                          nativeSymbol={networkBalances[0]?.network?.nativeCurrency.symbol ?? '—'}
                          onTokenClick={handleTokenClick}
                          allNetworksData={networkBalances}
                        />
                      ))
                    )
                  ) : selectedAccount ? (
                    <AccountCard
                      account={selectedAccount}
                      nativeSymbol={nativeSymbol}
                      onTokenClick={handleTokenClick}
                    />
                  ) : (
                    <ContentLoadingPlaceholder message="Loading account..." showSkeleton />
                  )}
                </Spin>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Wallet Modal */}
      <WalletModal
        open={isWalletModalOpen}
        onClose={handleCloseModal}
        availableWallets={availableWallets}
        connectedWalletId={connectedWalletId}
        connectingWalletId={connectingWalletId}
        onConnect={connectToWallet}
      />

      {/* Buy Modal */}
      <BuyModal
        open={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        nativeSymbol={nativeSymbol}
      />

      {/* Swap Modal */}
      <SwapModal
        open={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        account={selectedAccount}
        nativeSymbol={nativeSymbol}
      />

      {/* Send Modal */}
      <SendModal
        open={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        account={selectedAccount}
        nativeSymbol={nativeSymbol}
        onSend={handleSendTransaction}
      />

      {/* Receive Modal */}
      <ReceiveModal
        open={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        address={receiveAddress}
        currentChainId={receiveChainId}
      />
    </div>
  )
}

export default App
