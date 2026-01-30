import { useState, useRef, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import type { WalletProvider, TokenInfo, AccountInfo, NetworkConfig } from '../types'
import { SUPPORTED_NETWORKS, COMMON_TOKENS, ERC20_ABI } from '../constants'
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
  isWalletModalOpen: boolean
  availableWallets: WalletProvider[]
  currentChainId: string
  isNetworkSwitching: boolean
  currentNetwork: NetworkConfig | null
  nativeSymbol: string
  connectedWalletId: string
  ethersProvider: ethers.BrowserProvider | null
  setIsWalletModalOpen: (open: boolean) => void
  handleConnectWallet: () => Promise<void>
  connectToWallet: (wallet: WalletProvider) => Promise<void>
  disconnectWallet: () => void
  handleNetworkSwitch: (chainId: string) => Promise<void>
  fetchAllAccounts: (provider: ethers.BrowserProvider) => Promise<void>
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
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  const [connectedWalletId, setConnectedWalletId] = useState<string>('')

  const walletProviderRef = useRef<any>(null)
  const ethersProviderRef = useRef<ethers.BrowserProvider | null>(null)

  const getCurrentNetwork = () => {
    if (!currentChainId) return null
    return SUPPORTED_NETWORKS[currentChainId] || null
  }

  const currentNetwork = getCurrentNetwork()
  const nativeSymbol = currentNetwork?.nativeCurrency.symbol || 'ETH'

  // Get token info
  const getTokenInfo = async (
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
  }

  // Fetch account tokens
  const fetchAccountTokens = async (
    provider: ethers.BrowserProvider,
    accountAddress: string,
    chainId: string
  ): Promise<TokenInfo[]> => {
    const tokens = COMMON_TOKENS[chainId] || []
    const tokenInfos = await Promise.all(
      tokens.map(token => getTokenInfo(provider, token.address, accountAddress))
    )
    return tokenInfos.filter((token): token is TokenInfo => token !== null)
  }

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
  }, [])

  // Update current chain ID
  const updateCurrentChainId = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const chainIdHex = `0x${network.chainId.toString(16)}`
      setCurrentChainId(chainIdHex)
    } catch (error) {
      console.error('Failed to get chain ID:', error)
    }
  }

  // Update wallet info
  const updateWalletInfo = async (provider: ethers.BrowserProvider, account: string) => {
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
  }

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletInfo({ account: '', balance: BigInt(-1), signer: null })
    setAccountsInfo([])
    setCurrentChainId('')
    setConnectedWalletId('')
    walletProviderRef.current?.removeAllListeners?.()
    walletProviderRef.current = null
    ethersProviderRef.current = null
  }, [])

  // Setup listeners
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
  }, [disconnectWallet])

  // Handle connect wallet - detect available wallets
  const handleConnectWallet = async () => {
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

    const normalizeWalletName = (name: string) => {
      const trimmedName = name.trim()
      if (/^okx\s*wallet$/i.test(trimmedName.replace(/\s+/g, ' ')) || trimmedName.toLowerCase() === 'okx') {
        return 'OKEx Wallet'
      }
      return trimmedName
    }

    const getWalletKey = (name: string) =>
      normalizeWalletName(name).toLowerCase().replace(/\s+/g, '-')

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

    const detectedWallets = Array.from(walletByNameMap.values())

    if (detectedWallets.length === 0) {
      message.error('No wallet detected! Please install a wallet extension like MetaMask.')
      return
    }

    setAvailableWallets(detectedWallets)
    setIsWalletModalOpen(true)
  }

  // Connect to specific wallet
  const connectToWallet = async (wallet: WalletProvider) => {
    try {
      setIsWalletModalOpen(false)
      const walletProvider = wallet.provider

      if (!walletProvider || typeof walletProvider.request !== 'function') {
        message.error('Invalid wallet provider')
        return
      }

      const fromEip6963 = wallet.id.startsWith('eip6963-')

      if (!fromEip6963) {
        const detectedName = getWalletName(walletProvider)
        if (detectedName !== wallet.name) {
          message.error(`Wallet mismatch: Selected ${wallet.name} but detected ${detectedName}. Please try again.`)
          return
        }
        if (wallet.name === 'MetaMask' && walletProvider.isOKExWallet === true) {
          message.error('Selected MetaMask but this provider is OKX. Please choose MetaMask from the list again.')
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
        return
      }

      await updateWalletInfo(ethersProvider, accounts[0])
      setupListeners(walletProvider)
      setConnectedWalletId(wallet.id)

      const isSwitch = walletInfo.account !== ''
      message.success(isSwitch ? `Switched to ${wallet.name}` : `Connected to ${wallet.name}`)
    } catch (error: any) {
      message.error(`Failed to connect: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle network switch
  const handleNetworkSwitch = async (chainId: string) => {
    if (!walletProviderRef.current) {
      message.error('Please connect your wallet first')
      return
    }
    if (chainId === currentChainId) return

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
  }

  // Cleanup on unmount
  useEffect(() => () => walletProviderRef.current?.removeAllListeners?.(), [])

  return {
    walletInfo,
    accountsInfo,
    loading,
    isWalletModalOpen,
    availableWallets,
    currentChainId,
    isNetworkSwitching,
    currentNetwork,
    nativeSymbol,
    connectedWalletId,
    ethersProvider: ethersProviderRef.current,
    setIsWalletModalOpen,
    handleConnectWallet,
    connectToWallet,
    disconnectWallet,
    handleNetworkSwitch,
    fetchAllAccounts,
  }
}
