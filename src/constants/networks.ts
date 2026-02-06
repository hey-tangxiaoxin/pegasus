import type { NetworkConfig } from '../types'

/** 网络下拉框“所有网络”选项的 value，仅用于展示聚合数据，不触发钱包切链 */
export const ALL_NETWORKS_CHAIN_ID = 'all'

/** Solana 主网在配置中的 chainId（非 EVM，不参与 wallet_switchEthereumChain） */
export const SOLANA_CHAIN_ID = 'solana'

/** Bitcoin 主网在配置中的 chainId（非 EVM，不参与 wallet_switchEthereumChain） */
export const BITCOIN_CHAIN_ID = 'bitcoin'

/** Solana 网络配置（用于与 chainid.network 动态链列表合并） */
export function getSolanaNetworkConfig(): NetworkConfig {
  return {
    chainId: SOLANA_CHAIN_ID,
    chainName: 'Solana',
    shortName: 'Solana',
    displayName: 'Solana',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    rpcUrls: ['https://solana.publicnode.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    iconKey: 'solana',
    iconColor: '#9945FF',
    isTestnet: false,
  }
}

/** Bitcoin 网络配置（用于与 chainid.network 动态链列表合并） */
export function getBitcoinNetworkConfig(): NetworkConfig {
  return {
    chainId: BITCOIN_CHAIN_ID,
    chainName: 'Bitcoin',
    shortName: 'Bitcoin',
    displayName: 'Bitcoin',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    rpcUrls: ['https://mempool.space/api'],
    blockExplorerUrls: ['https://mempool.space'],
    iconKey: 'bitcoin',
    iconColor: '#F7931A',
    isTestnet: false,
  }
}

// 支持的网络配置
export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  // ========== 主网 ==========
  '0x1': {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
    iconKey: 'ethereum',
    iconColor: '#627EEA',
    isTestnet: false,
  },
  '0x89': {
    chainId: '0x89',
    chainName: 'Polygon',
    shortName: 'Polygon',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconKey: 'polygon',
    iconColor: '#8247E5',
    isTestnet: false,
  },
  '0xa4b1': {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    shortName: 'Arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/arbitrum'],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconKey: 'arbitrum',
    iconColor: '#28A0F0',
    isTestnet: false,
  },
  '0xa': {
    chainId: '0xa',
    chainName: 'Optimism',
    shortName: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconKey: 'optimism',
    iconColor: '#FF0420',
    isTestnet: false,
  },
  '0x38': {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    iconKey: 'bnb',
    iconColor: '#F0B90B',
    isTestnet: false,
  },
  '0x2105': {
    chainId: '0x2105',
    chainName: 'Base',
    shortName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    iconKey: 'base',
    iconColor: '#0052FF',
    isTestnet: false,
  },
  '0xa86a': {
    chainId: '0xa86a',
    chainName: 'Avalanche C-Chain',
    shortName: 'Avalanche',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/avalanche'],
    blockExplorerUrls: ['https://snowtrace.io'],
    iconKey: 'avalanche',
    iconColor: '#E84142',
    isTestnet: false,
  },
  '0x144': {
    chainId: '0x144',
    chainName: 'zkSync Era',
    shortName: 'zkSync',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.era.zksync.io'],
    blockExplorerUrls: ['https://explorer.zksync.io'],
    iconKey: 'zkSync',
    iconColor: '#1E69FF',
    isTestnet: false,
  },
  '0xe708': {
    chainId: '0xe708',
    chainName: 'Linea',
    shortName: 'Linea',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorerUrls: ['https://lineascan.build'],
    iconKey: 'linea',
    iconColor: '#121212',
    isTestnet: false,
  },
  [SOLANA_CHAIN_ID]: getSolanaNetworkConfig(),
  [BITCOIN_CHAIN_ID]: getBitcoinNetworkConfig(),
  // ========== 测试网 ==========
  '0xaa36a7': {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    shortName: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconKey: 'ethereum',
    iconColor: '#627EEA',
    isTestnet: true,
  },
  '0x13882': {
    chainId: '0x13882',
    chainName: 'Polygon Amoy',
    shortName: 'Amoy',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
    iconKey: 'polygon',
    iconColor: '#8247E5',
    isTestnet: true,
  },
  '0x66eee': {
    chainId: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    shortName: 'Arb Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arbitrum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
    iconKey: 'arbitrum',
    iconColor: '#28A0F0',
    isTestnet: true,
  },
  '0xaa37dc': {
    chainId: '0xaa37dc',
    chainName: 'Optimism Sepolia',
    shortName: 'OP Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
    iconKey: 'optimism',
    iconColor: '#FF0420',
    isTestnet: true,
  },
  '0x61': {
    chainId: '0x61',
    chainName: 'BSC Testnet',
    shortName: 'BSC Test',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    iconKey: 'bnb',
    iconColor: '#F0B90B',
    isTestnet: true,
  },
  '0x14a34': {
    chainId: '0x14a34',
    chainName: 'Base Sepolia',
    shortName: 'Base Sep',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    iconKey: 'base',
    iconColor: '#0052FF',
    isTestnet: true,
  },
  '0xa869': {
    chainId: '0xa869',
    chainName: 'Avalanche Fuji',
    shortName: 'Fuji',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/avalanche_fuji'],
    blockExplorerUrls: ['https://testnet.snowtrace.io'],
    iconKey: 'avalanche',
    iconColor: '#E84142',
    isTestnet: true,
  },
  '0x12c': {
    chainId: '0x12c',
    chainName: 'zkSync Sepolia',
    shortName: 'zkSync Sep',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.era.zksync.dev'],
    blockExplorerUrls: ['https://sepolia.explorer.zksync.io'],
    iconKey: 'zkSync',
    iconColor: '#1E69FF',
    isTestnet: true,
  },
  '0xe705': {
    chainId: '0xe705',
    chainName: 'Linea Sepolia',
    shortName: 'Linea Sep',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.linea.build'],
    blockExplorerUrls: ['https://sepolia.lineascan.build'],
    iconKey: 'linea',
    iconColor: '#121212',
    isTestnet: true,
  },
}

/**
 * 用于「所有网络」只读查询的公开 RPC（无需 API Key，避免 401/400）。
 * 钱包切链仍用 SUPPORTED_NETWORKS 的 rpcUrls；此处仅用于跨链余额/代币查询。
 * 注意：URL 勿带尾部斜杠，部分 RPC 会因此返回 400。
 */
export const PUBLIC_READ_ONLY_RPC: Partial<Record<string, string>> = {
  '0x1': 'https://rpc.ankr.com/eth',
  '0x89': 'https://polygon-rpc.com',
  '0xa4b1': 'https://rpc.ankr.com/arbitrum',
  '0xa': 'https://mainnet.optimism.io',
  '0x38': 'https://bsc-dataseed.binance.org',
  '0x2105': 'https://mainnet.base.org',
  '0xa86a': 'https://rpc.ankr.com/avalanche',
  '0x144': 'https://mainnet.era.zksync.io',
  '0xe708': 'https://rpc.linea.build',
  '0xaa36a7': 'https://ethereum-sepolia.publicnode.com',
  '0x13882': 'https://rpc-amoy.polygon.technology',
  '0x66eee': 'https://arbitrum-sepolia-rpc.publicnode.com',
  '0xaa37dc': 'https://sepolia.optimism.io',
  '0x61': 'https://data-seed-prebsc-1-s1.binance.org:8545',
  '0x14a34': 'https://sepolia.base.org',
  '0xa869': 'https://rpc.ankr.com/avalanche_fuji',
  '0x12c': 'https://sepolia.era.zksync.dev',
  '0xe705': 'https://rpc.sepolia.linea.build',
}
