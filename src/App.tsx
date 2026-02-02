import { useCallback } from 'react'
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
  TransferForm, 
  WalletModal,
  NetworkSelector 
} from './components'

function App() {
  const [form] = Form.useForm()
  
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

  // Memoize token click handler factory
  const handleTokenClick = useCallback((token: { address: string }) => {
    form.setFieldsValue({ tokenAddress: token.address })
  }, [form])

  // Memoize modal close handler
  const handleCloseModal = useCallback(() => {
    setIsWalletModalOpen(false)
  }, [setIsWalletModalOpen])

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
            />

            <Spin spinning={loading}>
              {accountsInfo.map((account) => (
                <AccountCard
                  key={account.address}
                  account={account}
                  nativeSymbol={nativeSymbol}
                  onTokenClick={handleTokenClick}
                />
              ))}
            </Spin>

            <TransferForm form={form} onSubmit={handleSendTransaction} />
          </>
        )}
      </main>

      <WalletModal
        open={isWalletModalOpen}
        onClose={handleCloseModal}
        availableWallets={availableWallets}
        connectedWalletId={connectedWalletId}
        onConnect={connectToWallet}
      />
    </div>
  )
}

export default App
