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
    isWalletModalOpen,
    availableWallets,
    currentChainId,
    isNetworkSwitching,
    nativeSymbol,
    connectedWalletId,
    connectingWalletId,
    ethersProvider,
    setIsWalletModalOpen,
    handleConnectWallet,
    connectToWallet,
    disconnectWallet,
    handleNetworkSwitch,
    fetchAllAccounts,
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

  // Reset selected account index when accounts change
  useEffect(() => {
    if (selectedAccountIndex >= accountsInfo.length && accountsInfo.length > 0) {
      setSelectedAccountIndex(0)
    }
  }, [accountsInfo.length, selectedAccountIndex])

  // Get the currently selected account
  const selectedAccount = accountsInfo[selectedAccountIndex]

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
          <>
            <NetworkSelector
              currentChainId={currentChainId}
              isNetworkSwitching={isNetworkSwitching}
              isDisabled={!walletInfo.account}
              onNetworkSwitch={handleNetworkSwitch}
              accounts={accountsInfo}
              selectedAccountIndex={selectedAccountIndex}
              onAccountChange={handleAccountChange}
            />

            <ActionButtons onAction={handleAction} disabled={loading} />

            <Spin spinning={loading}>
              {selectedAccount && (
                <AccountCard
                  account={selectedAccount}
                  nativeSymbol={nativeSymbol}
                  onTokenClick={handleTokenClick}
                />
              )}
            </Spin>
          </>
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
