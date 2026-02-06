import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import type { WalletProvider, TokenInfo, AccountInfo, NetworkConfig, NetworkBalanceInfo } from '../types'
import { SUPPORTED_NETWORKS, COMMON_TOKENS, ERC20_ABI, ALL_NETWORKS_CHAIN_ID, PUBLIC_READ_ONLY_RPC } from '../constants'
import { detectAvailableWallets, getWalletName } from '../utils'

export interface WalletState {
  account: string
  balance: bigint
  signer: ethers.Signer | null
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
  /** “所有网络”视图下各链的余额与代币（仅当 displayChainId === 'all' 时有值） */
  allNetworksAccountInfo: NetworkBalanceInfo[] | null
  connectedWalletId: string
  connectingWalletId: string
  ethersProvider: ethers.BrowserProvider | null
  setIsWalletModalOpen: (open: boolean) => void
  handleConnectWallet: () => void
  connectToWallet: (wallet: WalletProvider) => Promise<void>
  disconnectWallet: () => void
  handleNetworkSwitch: (chainId: string) => Promise<void>
  fetchAllAccounts: (provider: ethers.BrowserProvider) => Promise<void>
  fetchAllNetworksAccount: (accountAddress: string) => Promise<void>
}

export function useWallet(): UseWalletReturn {
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
  const [displayChainId, setDisplayChainId] = useState<string>('')
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  const [loadingAllNetworks, setLoadingAllNetworks] = useState(false)
  const [allNetworksAccountInfo, setAllNetworksAccountInfo] = useState<NetworkBalanceInfo[] | null>(null)
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

  // Memoize current network to avoid unnecessary recalculations
  const currentNetwork = useMemo(() => {
    if (!currentChainId) return null
    return SUPPORTED_NETWORKS[currentChainId] || null
  }, [currentChainId])

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

  // Fetch account tokens - memoized
  const fetchAccountTokens = useCallback(async (
    provider: ethers.BrowserProvider,
    accountAddress: string,
    chainId: string
  ): Promise<TokenInfo[]> => {
    const tokens = COMMON_TOKENS[chainId] || []
    const tokenInfos = await Promise.all(
      tokens.map(token => getTokenInfo(provider, token.address, accountAddress))
    )
    return tokenInfos.filter((token): token is TokenInfo => token !== null)
  }, [getTokenInfo])

  // Fetch all accounts
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
            const [nativeTokenBalance, tokenList, ensName] = await Promise.all([
              provider.getBalance(address),
              fetchAccountTokens(provider, address, chainIdHex),
              provider.lookupAddress(address).catch(() => null as string | null),
            ])

            return {
              address,
              name: ensName ?? `Account ${index + 1}`,
              nativeBalance: ethers.formatEther(nativeTokenBalance),
              tokens: tokenList,
            }
          } catch {
            return {
              address,
              name: `Account ${index + 1}`,
              nativeBalance: '0',
              tokens: [],
            }
          }
        })
      )

      setAccountsInfo(accountsData)
    } catch {
      message.error('Failed to fetch account information')
    } finally {
      setLoading(false)
    }
  }, [fetchAccountTokens])

  // Fetch one account's balance + tokens across all supported networks (read-only via public RPC，避免 Infura 等需鉴权 RPC 返回 401)
  const fetchAllNetworksAccount = useCallback(async (accountAddress: string) => {
    setLoadingAllNetworks(true)
    setAllNetworksAccountInfo(null)
    try {
      const entries = Object.entries(SUPPORTED_NETWORKS)
      const results = await Promise.all(
        entries.map(async ([chainId, network]): Promise<NetworkBalanceInfo> => {
          let rpcUrl = PUBLIC_READ_ONLY_RPC[chainId] ?? network.rpcUrls?.[0]
          if (!rpcUrl) {
            return { chainId, network, nativeBalance: '0', tokens: [] }
          }
          rpcUrl = rpcUrl.replace(/\/+$/, '') // 去掉尾部斜杠，避免部分 RPC 返回 400
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
      setAllNetworksAccountInfo(results)
    } catch {
      message.error('Failed to fetch balances across networks')
    } finally {
      setLoadingAllNetworks(false)
    }
  }, [fetchAccountTokens])

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

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletInfo({ account: '', balance: BigInt(-1), signer: null })
    setAccountsInfo([])
    setCurrentChainId('')
    setDisplayChainId('')
    setAllNetworksAccountInfo(null)
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

            const network = SUPPORTED_NETWORKS[chainIdHex]
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
      setDisplayChainId(chainIdHex)
      setWalletInfo({ account, balance, signer })

      setupListeners(walletProvider)

      const isSwitch = walletInfo.account !== ''
      message.success(isSwitch ? `Switched to ${wallet.name}` : `Connected to ${wallet.name}`)

      // Load full account list and tokens in background (no block; fetchAllAccounts manages loading state)
      fetchAllAccounts(ethersProvider).catch(() => {})
    } catch (error: any) {
      setConnectingWalletId('')
      message.error(`Failed to connect: ${error.message || 'Unknown error'}`)
    }
  }, [setupListeners, walletInfo.account, fetchAllAccounts])

  // Handle network switch - memoized（支持选择「所有网络」仅聚合展示，不切链）
  const handleNetworkSwitch = useCallback(async (chainId: string) => {
    if (chainId === ALL_NETWORKS_CHAIN_ID) {
      if (!walletInfo.account) {
        message.error('Please connect your wallet first')
        return
      }
      setDisplayChainId(ALL_NETWORKS_CHAIN_ID)
      // Actual fetch is triggered by App effect when displayChainId becomes 'all' and selectedAccount is set
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
    const networkConfig = SUPPORTED_NETWORKS[chainId]

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
  }, [currentChainId, walletInfo.account, fetchAllNetworksAccount])

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
    allNetworksAccountInfo,
    connectedWalletId,
    connectingWalletId,
    ethersProvider: ethersProviderRef.current,
    setIsWalletModalOpen,
    handleConnectWallet,
    connectToWallet,
    disconnectWallet,
    handleNetworkSwitch,
    fetchAllAccounts,
    fetchAllNetworksAccount,
  }
}
