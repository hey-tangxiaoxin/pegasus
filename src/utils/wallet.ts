import type { WalletProvider } from '../types'

// 获取钱包唯一 ID
export const getWalletId = (provider: WalletProvider['provider'], index: number): string => {
  // 使用 provider 的唯一标识符或索引作为 ID
  // 重要：OKX 钱包优先识别
  if (provider?.isOKExWallet) return `okx-${index}`
  if (provider?.isMetaMask) return `metamask-${index}`
  if (provider?.isCoinbaseWallet) return `coinbase-${index}`
  if (provider?.isTrust) return `trust-${index}`
  if (provider?.isTokenPocket) return `tokenpocket-${index}`
  if (provider?.isImToken) return `imtoken-${index}`
  if (provider?.isBitKeep) return `bitkeep-${index}`
  if (provider?.isRabby) return `rabby-${index}`
  if (provider?.isBraveWallet) return `brave-${index}`

  // 使用 provider 对象引用作为唯一标识
  return `wallet-${index}-${Object.prototype.toString.call(provider)}`
}

// 获取钱包名称
export const getWalletName = (provider: WalletProvider['provider']): string => {
  // 按优先级检查钱包标识符，确保准确识别
  // 重要：OKX 钱包可能同时有 isMetaMask 和 isOKExWallet，需要优先检查 isOKExWallet
  if (provider.isOKExWallet) {
    // OKX 钱包优先识别，即使它也有 isMetaMask
    return 'OKEx Wallet'
  }
  if (provider.isMetaMask) {
    // 只有在不是 OKX 的情况下才识别为 MetaMask
    return 'MetaMask'
  }
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
  if (provider.isTrust) return 'Trust Wallet'
  if (provider.isTokenPocket) return 'TokenPocket'
  if (provider.isImToken) return 'imToken'
  if (provider.isBitKeep) return 'BitKeep'
  if (provider.isRabby) return 'Rabby'
  if (provider.isBraveWallet) return 'Brave Wallet'

  // 尝试从 provider 的其他属性推断
  if (provider.constructor?.name) {
    const constructorName = provider.constructor.name
    // 优先检查 OKX
    if (constructorName.includes('OKX') || constructorName.includes('Okx') || constructorName.includes('OKEx')) {
      return 'OKEx Wallet'
    }
    if (constructorName.includes('MetaMask')) {
      return 'MetaMask'
    }
  }

  // 检查 window.okxwallet（OKX 钱包的特殊标识）
  if (typeof window !== 'undefined' && (window as any).okxwallet === provider) {
    return 'OKEx Wallet'
  }

  return 'Unknown Wallet'
}

// 检测可用钱包
export const detectAvailableWallets = (): WalletProvider[] => {
  if (!window.ethereum) return []

  // 如果 providers 数组存在，使用它（应包含所有钱包）
  // 否则只使用 window.ethereum 本身
  const providerList = window.ethereum.providers || [window.ethereum]
  const walletMap = new Map<string, WalletProvider>()
  const processedProviders = new Set<any>() // 跟踪已处理的 provider 对象

  providerList.forEach((provider: any, index: number) => {
    // 检查是否已经处理过这个 provider 对象（避免重复）
    if (processedProviders.has(provider)) {
      return
    }

    const walletName = getWalletName(provider)
    const walletId = getWalletId(provider, index)

    // 检查是否已存在相同名称和类型的钱包
    const isDuplicateWallet = Array.from(walletMap.values()).find(existingWallet => {
      // 如果是同一个 provider 对象，跳过
      if (existingWallet.provider === provider) return true
      // 如果名称相同，进一步检查
      if (existingWallet.name === walletName) {
        // 对于 MetaMask，检查 isMetaMask 属性（但不检查 isOKExWallet，因为 OKX 可能也有 isMetaMask）
        if (walletName === 'MetaMask') {
          return existingWallet.provider?.isMetaMask && provider?.isMetaMask && 
                 !existingWallet.provider?.isOKExWallet && !provider?.isOKExWallet
        }
        // 对于 OKX，检查 isOKExWallet 属性
        if (walletName === 'OKEx Wallet') {
          return existingWallet.provider?.isOKExWallet && provider?.isOKExWallet
        }
      }
      return false
    })

    if (!isDuplicateWallet) {
      walletMap.set(walletId, { name: walletName, provider, id: walletId })
      processedProviders.add(provider)
    }
  })

  return Array.from(walletMap.values())
}
