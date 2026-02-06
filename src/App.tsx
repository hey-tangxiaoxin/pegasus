import { useCallback, useState, useEffect } from 'react'
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
} from './components'
import type { ActionType } from './components'
import { ALL_NETWORKS_CHAIN_ID } from './constants'

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
    allNetworksAccountInfo,
    connectedWalletId,
    connectingWalletId,
    ethersProvider,
    setIsWalletModalOpen,
    handleConnectWallet,
    connectToWallet,
    disconnectWallet,
    handleNetworkSwitch,
    fetchAllAccounts,
    fetchAllNetworksAccount,
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

  // Reset selected account index when accounts change
  useEffect(() => {
    if (selectedAccountIndex >= accountsInfo.length && accountsInfo.length > 0) {
      setSelectedAccountIndex(0)
    }
  }, [accountsInfo.length, selectedAccountIndex])

  // When in "All Networks" view and selected account changes, refetch all-networks data for that account
  useEffect(() => {
    if (displayChainId !== ALL_NETWORKS_CHAIN_ID || !selectedAccount?.address) return
    fetchAllNetworksAccount(selectedAccount.address).catch(() => {})
  }, [displayChainId, selectedAccount?.address, fetchAllNetworksAccount])

  return (
    <div className={styles.appContainer}>
      <Header
        account={walletInfo.account}
        onConnect={handleConnectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className={styles.mainContent}>
        {!walletInfo.account ? (
          <WelcomeSection onConnect={handleConnectWallet} />
        ) : (
          <div className={loading || loadingAllNetworks ? styles.accountAreaLoading : undefined}>
            <NetworkSelector
              currentChainId={currentChainId}
              displayChainId={displayChainId}
              isNetworkSwitching={isNetworkSwitching}
              isDisabled={!walletInfo.account || loading}
              onNetworkSwitch={handleNetworkSwitch}
              accounts={accountsInfo}
              selectedAccountIndex={selectedAccountIndex}
              onAccountChange={handleAccountChange}
            />

            <ActionButtons onAction={handleAction} disabled={loading || loadingAllNetworks} />

            <Spin spinning={loading || loadingAllNetworks}>
              {selectedAccount && (
                <AccountCard
                  account={selectedAccount}
                  nativeSymbol={nativeSymbol}
                  onTokenClick={handleTokenClick}
                  allNetworksData={displayChainId === ALL_NETWORKS_CHAIN_ID ? allNetworksAccountInfo : undefined}
                />
              )}
            </Spin>
          </div>
        )}
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
        address={selectedAccount?.address || ''}
        currentChainId={currentChainId}
      />
    </div>
  )
}

export default App
