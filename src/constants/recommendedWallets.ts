// Recommended wallets with Chrome Web Store download links
export interface RecommendedWallet {
  name: string
  chromeStoreUrl: string
  description: string
}

export const RECOMMENDED_WALLETS: RecommendedWallet[] = [
  {
    name: 'MetaMask',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
    description: 'The most popular Web3 wallet',
  },
  {
    name: 'OKX Wallet',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
    description: 'Multi-chain crypto wallet',
  },
  {
    name: 'Coinbase Wallet',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
    description: 'Self-custody crypto wallet',
  },
  {
    name: 'Trust Wallet',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph',
    description: 'Secure multi-chain wallet',
  },
  {
    name: 'Phantom',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
    description: 'Solana & multi-chain wallet',
  },
  {
    name: 'Rainbow',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/rainbow/opfgelmcmbiajamepnmloijbpoleiama',
    description: 'Fun & easy Ethereum wallet',
  },
  {
    name: 'Rabby',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch',
    description: 'Better UX for DeFi users',
  },
  {
    name: 'Bitget Wallet',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak',
    description: 'Web3 trading wallet',
  },
  {
    name: 'TokenPocket',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii',
    description: 'Multi-chain DeFi wallet',
  },
  {
    name: 'Zerion',
    chromeStoreUrl: 'https://chromewebstore.google.com/detail/zerion-wallet-for-web3-nf/klghhnkeealcohjjanjjdaeeggmfmlpl',
    description: 'Smart Web3 wallet',
  },
]
