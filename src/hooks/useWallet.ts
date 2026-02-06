import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import type { WalletProvider, TokenInfo, AccountInfo, NetworkConfig, NetworkBalanceInfo, WalletState } from '../types'
import { ERC20_ABI, ALL_NETWORKS_CHAIN_ID, SOLANA_CHAIN_ID, BITCOIN_CHAIN_ID } from '../constants'
import { useNetworks } from '../contexts/NetworksContext'
import { detectAvailableWallets, getWalletName } from '../utils'
import { connectSolana as connectSolanaUtil, connectBitcoin as connectBitcoinUtil } from '../utils/walletNonEvm'

const SKIP_AUTO_CONNECT_KEY = 'pegasus_skip_auto_connect'

function shouldSkipAutoConnect(): boolean {
  try {
    return sessionStorage.getItem(SKIP_AUTO_CONNECT_KEY) === '1'
  } catch {
    return false
  }
}

export interface UseWalletReturn {
  walletInfo: WalletState
  accountsInfo: AccountInfo[]
  loading: boolean
  loadingAllNetworks: boolean
  isWalletModalOpen: boolean
  availableWallets: WalletProvider[]
  currentChainId: string
  /** 当前展示用的网络：'all' 表示所有网络聚合，否则为链 ID */
  displayChainId: string
  isNetworkSwitching: boolean
  currentNetwork: NetworkConfig | null
  nativeSymbol: string
  /** “所有网络”视图：每个账号 + 各链余额（含 Solana），仅当 displayChainId === 'all' 时有值 */
  allNetworksByAccount: Array<{ account: AccountInfo; networkBalances: NetworkBalanceInfo[] }> | null
  /** 仅拉取当前选中账户在各链的余额与代币；需传入当前选中的 EVM 账户下标 */
  fetchAllNetworksForAllAccounts: (selectedAccountIndex: number) => Promise<void>
  /** 仅拉取当前链下指定账户的 token 列表（用于切换账户时按需加载） */
  fetchTokensForAccount: (accountIndex: number) => void
  connectedWalletId: string
  connectingWalletId: string
  ethersProvider: ethers.BrowserProvider | null
  setIsWalletModalOpen: (open: boolean) => void
  handleConnectWallet: () => void
  connectToWallet: (wallet: WalletProvider) => Promise<void>
  disconnectWallet: () => void
  handleNetworkSwitch: (chainId: string) => Promise<void>
  fetchAllAccounts: (provider: ethers.BrowserProvider) => Promise<void>
  /** Solana 账户（仅当选择 Solana 网络时使用） */
  solanaAccount: { publicKey: string; balance: string } | null
  connectSolanaWallet: () => Promise<void>
  /** Bitcoin 账户（仅当选择 Bitcoin 网络时使用） */
  bitcoinAccount: { address: string; balance: string } | null
  connectBitcoinWallet: () => Promise<void>
}

export function useWallet(): UseWalletReturn {
  const { supportedNetworks, getPublicRpc, getTokensForChain } = useNetworks()
  const [walletInfo, setWalletInfo] = useState<WalletState>({
    account: '',
    balance: BigInt(-1),
    signer: null,
  })
  const [accountsInfo, setAccountsInfo] = useState<AccountInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  const [currentChainId, setCurrentChainId] = useState<string>('')
  /** 展示用：'all' 或链 ID，选“所有网络”时为 'all' */
  const [displayChainId, setDisplayChainId] = useState<string>(ALL_NETWORKS_CHAIN_ID)
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  const [loadingAllNetworks, setLoadingAllNetworks] = useState(false)
  const [allNetworksByAccount, setAllNetworksByAccount] = useState<Array<{ account: AccountInfo; networkBalances: NetworkBalanceInfo[] }> | null>(null)
  const [solanaAccount, setSolanaAccount] = useState<{ publicKey: string; balance: string } | null>(null)
  const [bitcoinAccount, setBitcoinAccount] = useState<{ address: string; balance: string } | null>(null)
  const [connectedWalletId, setConnectedWalletId] = useState<string>('')
  const [connectingWalletId, setConnectingWalletId] = useState<string>('')

  const walletProviderRef = useRef<any>(null)
  const ethersProviderRef = useRef<ethers.BrowserProvider | null>(null)

  // Helper functions for wallet detection
  const normalizeWalletName = useCallback((name: string) => {
    const trimmedName = name.trim()
    if (/^okx\s*wallet$/i.test(trimmedName.replace(/\s+/g, ' ')) || trimmedName.toLowerCase() === 'okx') {
      return 'OKEx Wallet'
    }
    return trimmedName
  }, [])

  const getWalletKey = useCallback((name: string) =>
    normalizeWalletName(name).toLowerCase().replace(/\s+/g, '-'), [normalizeWalletName])

  // Detect available wallets - extracted as a reusable function
  const detectWallets = useCallback(async (): Promise<WalletProvider[]> => {
    const eip6963WalletList: Array<{ info: { name: string }; provider: any }> = []
    const eventHandler = (e: Event) => {
      const customEvent = e as unknown as CustomEvent<{ info: { name: string }; provider: any }>
      eip6963WalletList.push(customEvent.detail)
    }

    window.addEventListener('eip6963:announceProvider', eventHandler as EventListener)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    await new Promise(resolve => setTimeout(resolve, 500))
    window.removeEventListener('eip6963:announceProvider', eventHandler)

    const legacyWalletList = detectAvailableWallets()
    const walletByNameMap = new Map<string, WalletProvider>()

    eip6963WalletList.forEach(wallet => {
      const walletName = normalizeWalletName(wallet.info.name)
      const walletKey = getWalletKey(walletName)
      if (!walletByNameMap.has(walletKey)) {
        walletByNameMap.set(walletKey, {
          name: walletName,
          provider: wallet.provider,
          id: `eip6963-${walletKey}`
        })
      }
    })

    legacyWalletList.forEach(wallet => {
      const walletName = normalizeWalletName(wallet.name)
      const walletKey = getWalletKey(walletName)
      if (!walletByNameMap.has(walletKey)) {
        walletByNameMap.set(walletKey, { ...wallet, name: walletName })
      }
    })

    return Array.from(walletByNameMap.values())
  }, [normalizeWalletName, getWalletKey])

  // Pre-detect wallets on mount
  useEffect(() => {
    detectWallets().then(wallets => {
      setAvailableWallets(wallets)
    })
  }, [detectWallets])

  // 展示用网络：优先 displayChainId（含 Solana），否则用钱包当前链
  const currentNetwork = useMemo(() => {
    if (displayChainId && displayChainId !== ALL_NETWORKS_CHAIN_ID)
      return supportedNetworks[displayChainId] ?? null
    if (currentChainId) return supportedNetworks[currentChainId] ?? null
    return null
  }, [displayChainId, currentChainId, supportedNetworks])

  const nativeSymbol = useMemo(() =>
    currentNetwork?.nativeCurrency.symbol || 'ETH', [currentNetwork])

  // Get token info - memoized to avoid recreating on each render
  const getTokenInfo = useCallback(async (
    provider: ethers.BrowserProvider,
    tokenAddress: string,
    accountAddress: string
  ): Promise<TokenInfo | null> => {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(accountAddress).catch(() => BigInt(0)),
        contract.decimals().catch(() => 18),
        contract.symbol().catch(() => 'UNKNOWN'),
        contract.name().catch(() => 'Unknown Token'),
      ])

      if (balance === BigInt(0)) return null

      return {
        address: tokenAddress,
        symbol: String(symbol),
        name: String(name),
        balance: ethers.formatUnits(balance, Number(decimals)),
        decimals: Number(decimals),
      }
    } catch {
      return null
    }
  }, [])

  // Fetch account tokens - memoized（代币列表来自 1inch 动态接口）
  const fetchAccountTokens = useCallback(async (
    provider: ethers.BrowserProvider,
    accountAddress: string,
    chainId: string
  ): Promise<TokenInfo[]> => {
    const tokens = await getTokensForChain(chainId)
    const tokenInfos = await Promise.all(
      tokens.map(token => getTokenInfo(provider, token.address, accountAddress))
    )
    return tokenInfos.filter((token): token is TokenInfo => token !== null)
  }, [getTokenInfo, getTokensForChain])

  // Fetch all accounts：仅拉取原生余额与 ENS，不拉取 token；token 由 fetchTokensForAccount 按当前选中账户按需拉取
  const fetchAllAccounts = useCallback(async (provider: ethers.BrowserProvider) => {
    if (!provider) return
    setLoading(true)
    try {
      const accounts = await provider.send('eth_accounts', [])

      if (accounts.length === 0) {
        setAccountsInfo([])
        setLoading(false)
        return
      }

      const network = await provider.getNetwork()
      const chainIdHex = `0x${network.chainId.toString(16)}`

      const accountsData = await Promise.all(
        accounts.map(async (address: string, index: number) => {
          try {
            const [nativeTokenBalance, ensName] = await Promise.all([
              provider.getBalance(address),
              provider.lookupAddress(address).catch(() => null as string | null),
            ])
            return {
              address,
              name: ensName ?? `Account ${index + 1}`,
              nativeBalance: ethers.formatEther(nativeTokenBalance),
              tokens: [] as TokenInfo[],
            }
          } catch {
            return {
              address,
              name: `Account ${index + 1}`,
              nativeBalance: '0',
              tokens: [] as TokenInfo[],
            }
          }
        })
      )

      setAccountsInfo(accountsData)

      // 仅拉取当前链下「第一个账户」的 token，其余账户在用户切换时再按需拉取
      const tokenList = await fetchAccountTokens(provider, accountsData[0].address, chainIdHex)
      setAccountsInfo(prev => {
        if (prev.length === 0) return prev
        const next = [...prev]
        next[0] = { ...next[0], tokens: tokenList }
        return next
      })
    } catch {
      message.error('Failed to fetch account information')
    } finally {
      setLoading(false)
    }
  }, [fetchAccountTokens])

  // 仅拉取指定账户在当前链下的 token 列表（切换账户时按需调用）
  const fetchTokensForAccount = useCallback((accountIndex: number) => {
    const provider = ethersProviderRef.current
    if (!provider || !currentChainId) return
    setAccountsInfo(prev => {
      if (accountIndex < 0 || accountIndex >= prev.length) return prev
      const address = prev[accountIndex].address
      fetchAccountTokens(provider, address, currentChainId)
        .then(tokenList => {
          setAccountsInfo(p => {
            if (accountIndex >= p.length) return p
            const n = [...p]
            n[accountIndex] = { ...n[accountIndex], tokens: tokenList }
            return n
          })
        })
        .catch(() => message.error('Failed to fetch tokens'))
      return prev
    })
  }, [currentChainId, fetchAccountTokens])

  // 单地址在所有 EVM 链上的余额与代币（仅 EVM，不含 Solana）
  const fetchAllNetworksForOneAddress = useCallback(async (accountAddress: string): Promise<NetworkBalanceInfo[]> => {
    const entries = Object.entries(supportedNetworks).filter(([chainId]) => chainId !== SOLANA_CHAIN_ID && chainId !== BITCOIN_CHAIN_ID)
    const results = await Promise.all(
      entries.map(async ([chainId, network]): Promise<NetworkBalanceInfo> => {
        let rpcUrl = getPublicRpc(chainId) || network.rpcUrls?.[0]
        if (!rpcUrl) return { chainId, network, nativeBalance: '0', tokens: [] }
        rpcUrl = rpcUrl.replace(/\/+$/, '')
        try {
          const chainIdNum = parseInt(chainId, 16)
          const staticNet = ethers.Network.from({ chainId: chainIdNum, name: network.shortName })
          const provider = new ethers.JsonRpcProvider(rpcUrl, staticNet, { staticNetwork: staticNet })
          const [nativeBalance, tokens] = await Promise.all([
            provider.getBalance(accountAddress).then(b => ethers.formatEther(b)),
            fetchAccountTokens(provider as unknown as ethers.BrowserProvider, accountAddress, chainId),
          ])
          tokens.forEach(t => {
            t.chainId = chainId
            t.networkName = network.shortName
          })
          return { chainId, network, nativeBalance, tokens }
        } catch {
          return { chainId, network, nativeBalance: '0', tokens: [] }
        }
      })
    )
    return results
  }, [supportedNetworks, getPublicRpc, getTokensForChain, fetchAccountTokens])

  // “所有网络”：仅拉取「当前选中」EVM 账户在各链的余额与代币，以及 Solana/Bitcoin（若有）
  const fetchAllNetworksForAllAccounts = useCallback(async (selectedAccountIndex: number) => {
    setLoadingAllNetworks(true)
    setAllNetworksByAccount(null)
    try {
      const list: Array<{ account: AccountInfo; networkBalances: NetworkBalanceInfo[] }> = []
      const selectedAccount = accountsInfo[selectedAccountIndex]
      if (selectedAccount) {
        const networkBalances = await fetchAllNetworksForOneAddress(selectedAccount.address)
        list.push({ account: selectedAccount, networkBalances })
      }
      if (solanaAccount && supportedNetworks[SOLANA_CHAIN_ID]) {
        const solanaNetwork = supportedNetworks[SOLANA_CHAIN_ID]
        list.push({
          account: {
            name: 'Solana',
            address: solanaAccount.publicKey,
            nativeBalance: solanaAccount.balance,
            tokens: [],
          },
          networkBalances: [
            { chainId: SOLANA_CHAIN_ID, network: solanaNetwork, nativeBalance: solanaAccount.balance, tokens: [] },
          ],
        })
      }
      if (bitcoinAccount && supportedNetworks[BITCOIN_CHAIN_ID]) {
        const bitcoinNetwork = supportedNetworks[BITCOIN_CHAIN_ID]
        list.push({
          account: {
            name: 'Bitcoin',
            address: bitcoinAccount.address,
            nativeBalance: bitcoinAccount.balance,
            tokens: [],
          },
          networkBalances: [
            { chainId: BITCOIN_CHAIN_ID, network: bitcoinNetwork, nativeBalance: bitcoinAccount.balance, tokens: [] },
          ],
        })
      }
      setAllNetworksByAccount(list)
    } catch {
      message.error('Failed to fetch balances across networks')
    } finally {
      setLoadingAllNetworks(false)
    }
  }, [accountsInfo, solanaAccount, bitcoinAccount, supportedNetworks, fetchAllNetworksForOneAddress])

  // Update current chain ID - memoized
  const updateCurrentChainId = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const chainIdHex = `0x${network.chainId.toString(16)}`
      setCurrentChainId(chainIdHex)
    } catch (error) {
      console.error('Failed to get chain ID:', error)
    }
  }, [])

  // Update wallet info - memoized
  const updateWalletInfo = useCallback(async (provider: ethers.BrowserProvider, account: string) => {
    if (!provider) return
    try {
      const [balance, signer] = await Promise.all([
        provider.getBalance(account),
        provider.getSigner(),
      ])
      setWalletInfo({ account, balance, signer })
      await updateCurrentChainId(provider)
      await fetchAllAccounts(provider)
    } catch (error: any) {
      message.error(`Failed to update wallet info: ${error.message || 'Unknown error'}`)
    }
  }, [updateCurrentChainId, fetchAllAccounts])

  const tryAutoConnectSolana = useCallback(async (silent: boolean): Promise<boolean> => {
    const data = await connectSolanaUtil()
    if (data) {
      setSolanaAccount(data)
      if (!silent) {
        try { sessionStorage.removeItem(SKIP_AUTO_CONNECT_KEY) } catch { /* ignore */ }
        message.success('Solana wallet connected')
      }
      return true
    }
    if (!silent) {
      message.error(typeof window !== 'undefined' && window.solana ? 'Failed to connect Solana wallet' : 'Please install Phantom or another Solana wallet')
    }
    return false
  }, [])

  const tryAutoConnectBitcoin = useCallback(async (silent: boolean): Promise<boolean> => {
    const data = await connectBitcoinUtil()
    if (data) {
      setBitcoinAccount(data)
      if (!silent) {
        try { sessionStorage.removeItem(SKIP_AUTO_CONNECT_KEY) } catch { /* ignore */ }
        message.success('Bitcoin wallet connected')
      }
      return true
    }
    if (!silent) {
      message.error(typeof window !== 'undefined' && window.unisat ? 'No Bitcoin address returned' : 'Please install Unisat Wallet or another Bitcoin wallet extension')
    }
    return false
  }, [])

  const connectSolanaWallet = useCallback(async () => {
    await tryAutoConnectSolana(false)
  }, [tryAutoConnectSolana])
  const connectBitcoinWallet = useCallback(async () => {
    await tryAutoConnectBitcoin(false)
  }, [tryAutoConnectBitcoin])

  const tryAutoConnectNonEvmWallets = useCallback(async () => {
    await Promise.all([
      tryAutoConnectSolana(true),
      tryAutoConnectBitcoin(true),
    ])
  }, [tryAutoConnectSolana, tryAutoConnectBitcoin])

  const disconnectWallet = useCallback(() => {
    try {
      sessionStorage.setItem(SKIP_AUTO_CONNECT_KEY, '1')
    } catch { /* ignore */ }
    setWalletInfo({ account: '', balance: BigInt(-1), signer: null })
    setAccountsInfo([])
    setCurrentChainId('')
    setDisplayChainId(ALL_NETWORKS_CHAIN_ID)
    setAllNetworksByAccount(null)
    setSolanaAccount(null)
    setBitcoinAccount(null)
    setConnectedWalletId('')
    walletProviderRef.current?.removeAllListeners?.()
    walletProviderRef.current = null
    ethersProviderRef.current = null
  }, [])

  // Setup listeners - memoized with proper dependencies
  const setupListeners = useCallback((provider: WalletProvider['provider']) => {
    if (provider?.removeAllListeners) {
      provider.removeAllListeners()
    }

    if (provider.on) {
      provider.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (ethersProviderRef.current) {
          await updateWalletInfo(ethersProviderRef.current, accounts[0])
        }
      })
      provider.on('disconnect', disconnectWallet)
      provider.on('chainChanged', async (chainIdHex: string) => {
        try {
          setCurrentChainId(chainIdHex)
          setDisplayChainId(chainIdHex)

          if (walletProviderRef.current) {
            const newProvider = new ethers.BrowserProvider(walletProviderRef.current)
            ethersProviderRef.current = newProvider
            const accounts = await newProvider.send('eth_accounts', [])
            if (accounts.length > 0) {
              await updateWalletInfo(newProvider, accounts[0])
            }

            const network = supportedNetworks[chainIdHex]
            if (network) {
              message.info(`Network changed to ${network.chainName}`)
            } else {
              message.warning(`Switched to unsupported network (Chain ID: ${chainIdHex})`)
            }
          }
        } catch (error: any) {
          message.error(`Failed to handle chain change: ${error.message || 'Unknown error'}`)
        }
      })
    }
  }, [disconnectWallet, updateWalletInfo])

  // Handle connect wallet - open modal immediately with pre-detected wallets
  const handleConnectWallet = useCallback(() => {
    if (availableWallets.length === 0) {
      message.error('No wallet detected! Please install a wallet extension like MetaMask.')
      return
    }

    // Open modal immediately with pre-detected wallets
    setIsWalletModalOpen(true)
    
    // Refresh wallet list in background to catch any newly installed wallets
    detectWallets().then(freshWallets => {
      if (freshWallets.length > availableWallets.length) {
        setAvailableWallets(freshWallets)
      }
    })
  }, [availableWallets, detectWallets])

  // Connect to specific wallet - memoized
  const connectToWallet = useCallback(async (wallet: WalletProvider) => {
    setConnectingWalletId(wallet.id)
    try {
      const walletProvider = wallet.provider

      if (!walletProvider || typeof walletProvider.request !== 'function') {
        message.error('Invalid wallet provider')
        setConnectingWalletId('')
        return
      }

      const fromEip6963 = wallet.id.startsWith('eip6963-')

      if (!fromEip6963) {
        const detectedName = getWalletName(walletProvider)
        if (detectedName !== wallet.name) {
          message.error(`Wallet mismatch: Selected ${wallet.name} but detected ${detectedName}. Please try again.`)
          setConnectingWalletId('')
          return
        }
        if (wallet.name === 'MetaMask' && walletProvider.isOKExWallet === true) {
          message.error('Selected MetaMask but this provider is OKX. Please choose MetaMask from the list again.')
          setConnectingWalletId('')
          return
        }
      }

      // Clean up previous connection
      if (walletProviderRef.current) {
        walletProviderRef.current.removeAllListeners?.()
      }

      walletProviderRef.current = walletProvider
      const ethersProvider = new ethers.BrowserProvider(walletProvider)
      ethersProviderRef.current = ethersProvider

      const accounts = await walletProvider.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        message.error('No accounts found. Please unlock your wallet.')
        setConnectingWalletId('')
        return
      }

      const account = accounts[0]

      // Close modal and clear connecting state so UI can show main content
      setIsWalletModalOpen(false)
      setConnectingWalletId('')
      try {
        sessionStorage.removeItem(SKIP_AUTO_CONNECT_KEY)
      } catch { /* ignore */ }

      // Optimistic UI: show account immediately so user sees connected state without waiting for balances/tokens
      setWalletInfo({ account, balance: BigInt(0), signer: null })
      setAccountsInfo([{ address: account, name: 'Account 1', nativeBalance: '0', tokens: [] }])
      setConnectedWalletId(wallet.id)

      // Load network, balance and signer in parallel (fast path)
      const [network, balance, signer] = await Promise.all([
        ethersProvider.getNetwork(),
        ethersProvider.getBalance(account),
        ethersProvider.getSigner(),
      ])
      const chainIdHex = `0x${network.chainId.toString(16)}`
      setCurrentChainId(chainIdHex)
      setDisplayChainId(ALL_NETWORKS_CHAIN_ID)
      setWalletInfo({ account, balance, signer })

      setupListeners(walletProvider)

      const isSwitch = walletInfo.account !== ''
      message.success(isSwitch ? `Switched to ${wallet.name}` : `Connected to ${wallet.name}`)

      // Load full account list and tokens in background (no block; fetchAllAccounts manages loading state)
      fetchAllAccounts(ethersProvider).catch(() => {})
      // Auto-connect Solana & Bitcoin so "All Networks" shows them without manual connect
      tryAutoConnectNonEvmWallets().catch(() => {})
    } catch (error: any) {
      setConnectingWalletId('')
      message.error(`Failed to connect: ${error.message || 'Unknown error'}`)
    }
  }, [setupListeners, walletInfo.account, fetchAllAccounts, tryAutoConnectNonEvmWallets])

  // Handle network switch - memoized（支持选择「所有网络」仅聚合展示，不切链）
  const handleNetworkSwitch = useCallback(async (chainId: string) => {
    if (chainId === ALL_NETWORKS_CHAIN_ID) {
      const hasAny = !!(walletInfo.account || solanaAccount || bitcoinAccount)
      if (!hasAny) {
        message.error('Please connect your wallet first')
        return
      }
      setDisplayChainId(ALL_NETWORKS_CHAIN_ID)
      return
    }

    if (chainId === SOLANA_CHAIN_ID) {
      setDisplayChainId(SOLANA_CHAIN_ID)
      return
    }
    if (chainId === BITCOIN_CHAIN_ID) {
      setDisplayChainId(BITCOIN_CHAIN_ID)
      return
    }

    if (!walletProviderRef.current) {
      message.error('Please connect your wallet first')
      return
    }
    if (chainId === currentChainId) {
      setDisplayChainId(chainId)
      return
    }

    setIsNetworkSwitching(true)
    const networkConfig = supportedNetworks[chainId]

    if (!networkConfig) {
      message.error('Unsupported network')
      setIsNetworkSwitching(false)
      return
    }

    try {
      await walletProviderRef.current.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      setDisplayChainId(chainId)
      message.success(`Switched to ${networkConfig.chainName}`)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await walletProviderRef.current.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: networkConfig.chainId,
              chainName: networkConfig.chainName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
            }],
          })
          setDisplayChainId(chainId)
          message.success(`Added and switched to ${networkConfig.chainName}`)
        } catch (addNetworkError: any) {
          message.error(`Failed to add network: ${addNetworkError.message || 'Unknown error'}`)
        }
      } else if (switchError.code === 4001) {
        message.info('Network switch cancelled by user')
      } else {
        message.error(`Failed to switch network: ${switchError.message || 'Unknown error'}`)
      }
    } finally {
      setIsNetworkSwitching(false)
    }
  }, [currentChainId, walletInfo.account, solanaAccount, bitcoinAccount, supportedNetworks])

  // Auto-connect Solana & Bitcoin on mount only if user has not explicitly disconnected (refresh after disconnect should stay disconnected)
  useEffect(() => {
    if (shouldSkipAutoConnect()) return
    tryAutoConnectNonEvmWallets().catch(() => {})
  }, [tryAutoConnectNonEvmWallets])

  // Cleanup on unmount
  useEffect(() => () => walletProviderRef.current?.removeAllListeners?.(), [])

  return {
    walletInfo,
    accountsInfo,
    loading,
    loadingAllNetworks,
    isWalletModalOpen,
    availableWallets,
    currentChainId,
    displayChainId,
    isNetworkSwitching,
    currentNetwork,
    nativeSymbol,
    allNetworksByAccount,
    connectedWalletId,
    connectingWalletId,
    ethersProvider: ethersProviderRef.current,
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
  }
}
