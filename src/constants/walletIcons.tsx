import React from 'react'

// MetaMask Icon
const MetaMaskIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35.8 3L22.1 13.1L24.5 7.1L35.8 3Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
    <path d="M4.2 3L17.8 13.2L15.5 7.1L4.2 3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M30.8 27.2L27.2 32.8L35 35L37.2 27.4L30.8 27.2Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M2.8 27.4L5 35L12.8 32.8L9.2 27.2L2.8 27.4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M12.4 17.6L10.3 20.8L17.9 21.2L17.6 13L12.4 17.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M27.6 17.6L22.3 12.9L22.1 21.2L29.7 20.8L27.6 17.6Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M12.8 32.8L17.4 30.5L13.4 27.4L12.8 32.8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M22.6 30.5L27.2 32.8L26.6 27.4L22.6 30.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M27.2 32.8L22.6 30.5L23 33.5L22.9 34.9L27.2 32.8Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25"/>
    <path d="M12.8 32.8L17.1 34.9L17 33.5L17.4 30.5L12.8 32.8Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25"/>
    <path d="M17.2 25.8L13.3 24.7L16.1 23.5L17.2 25.8Z" fill="#233447" stroke="#233447" strokeWidth="0.25"/>
    <path d="M22.8 25.8L23.9 23.5L26.7 24.7L22.8 25.8Z" fill="#233447" stroke="#233447" strokeWidth="0.25"/>
    <path d="M12.8 32.8L13.4 27.2L9.2 27.4L12.8 32.8Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
    <path d="M26.6 27.2L27.2 32.8L30.8 27.4L26.6 27.2Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
    <path d="M29.7 20.8L22.1 21.2L22.8 25.8L23.9 23.5L26.7 24.7L29.7 20.8Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
    <path d="M13.3 24.7L16.1 23.5L17.2 25.8L17.9 21.2L10.3 20.8L13.3 24.7Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
    <path d="M10.3 20.8L13.4 27.4L13.3 24.7L10.3 20.8Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
    <path d="M26.7 24.7L26.6 27.4L29.7 20.8L26.7 24.7Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
    <path d="M17.9 21.2L17.2 25.8L18.1 30.3L18.3 23.9L17.9 21.2Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
    <path d="M22.1 21.2L21.7 23.8L21.9 30.3L22.8 25.8L22.1 21.2Z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
    <path d="M22.8 25.8L21.9 30.3L22.6 30.5L26.6 27.4L26.7 24.7L22.8 25.8Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
    <path d="M13.3 24.7L13.4 27.4L17.4 30.5L18.1 30.3L17.2 25.8L13.3 24.7Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
    <path d="M22.9 34.9L23 33.5L22.6 33.2H17.4L17 33.5L17.1 34.9L12.8 32.8L14.4 34.1L17.3 36H22.7L25.6 34.1L27.2 32.8L22.9 34.9Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25"/>
    <path d="M22.6 30.5L21.9 30.3H18.1L17.4 30.5L17 33.5L17.4 33.2H22.6L23 33.5L22.6 30.5Z" fill="#161616" stroke="#161616" strokeWidth="0.25"/>
    <path d="M36.4 13.8L37.5 9.2L35.8 3L22.6 12.7L27.6 17.6L34.7 19.7L36.5 17.6L35.7 17L37 15.8L36 15L37.3 14L36.4 13.8Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25"/>
    <path d="M2.5 9.2L3.6 13.8L2.7 14L4 15L3 15.8L4.3 17L3.5 17.6L5.3 19.7L12.4 17.6L17.4 12.7L4.2 3L2.5 9.2Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25"/>
    <path d="M34.7 19.7L27.6 17.6L29.7 20.8L26.6 27.4L30.8 27.4H37.2L34.7 19.7Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
    <path d="M12.4 17.6L5.3 19.7L2.8 27.4H9.2L13.4 27.4L10.3 20.8L12.4 17.6Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
    <path d="M22.1 21.2L22.6 12.7L24.5 7.1H15.5L17.4 12.7L17.9 21.2L18.1 24L18.1 30.3H21.9L21.9 24L22.1 21.2Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
  </svg>
)

// OKX Wallet Icon
const OKXIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="black"/>
    <rect x="8" y="8" width="10" height="10" rx="1" fill="white"/>
    <rect x="22" y="8" width="10" height="10" rx="1" fill="white"/>
    <rect x="8" y="22" width="10" height="10" rx="1" fill="white"/>
    <rect x="22" y="22" width="10" height="10" rx="1" fill="white"/>
    <rect x="15" y="15" width="10" height="10" rx="1" fill="white"/>
  </svg>
)

// Coinbase Wallet Icon
const CoinbaseIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0052FF"/>
    <circle cx="20" cy="20" r="12" fill="white"/>
    <rect x="15" y="15" width="10" height="10" rx="2" fill="#0052FF"/>
  </svg>
)

// Trust Wallet Icon
const TrustWalletIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0500FF"/>
    <path d="M20 6C20 6 8 11 8 20C8 29 20 34 20 34C20 34 32 29 32 20C32 11 20 6 20 6Z" fill="white"/>
    <path d="M20 9C20 9 11 13 11 20C11 27 20 31 20 31C20 31 29 27 29 20C29 13 20 9 20 9Z" fill="#0500FF"/>
    <path d="M20 12L20 26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15 17L20 22L25 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// WalletConnect Icon
const WalletConnectIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#3B99FC"/>
    <path d="M12 16C16.4 11.6 23.6 11.6 28 16L28.5 16.5C28.7 16.7 28.7 17.1 28.5 17.3L26.8 19C26.7 19.1 26.5 19.1 26.4 19L25.8 18.4C22.6 15.2 17.4 15.2 14.2 18.4L13.5 19.1C13.4 19.2 13.2 19.2 13.1 19.1L11.4 17.4C11.2 17.2 11.2 16.8 11.4 16.6L12 16ZM31.6 19.6L33.1 21.1C33.3 21.3 33.3 21.7 33.1 21.9L25.8 29.2C25.6 29.4 25.2 29.4 25 29.2L19.9 24.1C19.85 24.05 19.75 24.05 19.7 24.1L14.6 29.2C14.4 29.4 14 29.4 13.8 29.2L6.5 21.9C6.3 21.7 6.3 21.3 6.5 21.1L8 19.6C8.2 19.4 8.6 19.4 8.8 19.6L13.9 24.7C13.95 24.75 14.05 24.75 14.1 24.7L19.2 19.6C19.4 19.4 19.8 19.4 20 19.6L25.1 24.7C25.15 24.75 25.25 24.75 25.3 24.7L30.4 19.6C30.6 19.4 31 19.4 31.2 19.6L31.6 19.6Z" fill="white"/>
  </svg>
)

// Rainbow Wallet Icon
const RainbowIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="url(#rainbow-gradient)"/>
    <path d="M8 28C8 17 17 8 28 8" stroke="#FF4000" strokeWidth="4" strokeLinecap="round"/>
    <path d="M8 28C8 20 14 14 22 14" stroke="#FFBD00" strokeWidth="4" strokeLinecap="round"/>
    <path d="M8 28C8 23 11 20 16 20" stroke="#00D146" strokeWidth="4" strokeLinecap="round"/>
    <path d="M8 28C8 26 9 25 11 25" stroke="#00BFFF" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="8" cy="28" r="3" fill="#8B5CF6"/>
    <defs>
      <linearGradient id="rainbow-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#174299"/>
        <stop offset="1" stopColor="#001E59"/>
      </linearGradient>
    </defs>
  </svg>
)

// Phantom Wallet Icon
const PhantomIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="url(#phantom-gradient)"/>
    <path d="M32 20C32 16.5 30 13.5 27 12C27.5 13 28 14.5 28 16C28 20 24.5 23 20 23C15.5 23 12 20 12 16C12 14.5 12.5 13 13 12C10 13.5 8 16.5 8 20C8 26.5 13.5 32 20 32C26.5 32 32 26.5 32 20Z" fill="white"/>
    <circle cx="15" cy="17" r="2" fill="#533CD4"/>
    <circle cx="25" cy="17" r="2" fill="#533CD4"/>
    <defs>
      <linearGradient id="phantom-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#533CD4"/>
        <stop offset="1" stopColor="#4426A0"/>
      </linearGradient>
    </defs>
  </svg>
)

// Rabby Wallet Icon
const RabbyIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="url(#rabby-gradient)"/>
    <ellipse cx="20" cy="22" rx="12" ry="10" fill="white"/>
    <ellipse cx="15" cy="20" rx="3" ry="4" fill="#7C7CFF"/>
    <ellipse cx="25" cy="20" rx="3" ry="4" fill="#7C7CFF"/>
    <ellipse cx="15" cy="19" rx="1.5" ry="2" fill="black"/>
    <ellipse cx="25" cy="19" rx="1.5" ry="2" fill="black"/>
    <path d="M12 10C14 8 18 7 20 8C22 7 26 8 28 10C30 12 29 15 27 16C25 17 23 16 20 16C17 16 15 17 13 16C11 15 10 12 12 10Z" fill="white"/>
    <defs>
      <linearGradient id="rabby-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8697FF"/>
        <stop offset="1" stopColor="#6C7BFF"/>
      </linearGradient>
    </defs>
  </svg>
)

// Bitget Wallet Icon
const BitgetIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#00D4AA"/>
    <path d="M10 20L20 10L30 20L20 30L10 20Z" fill="white"/>
    <path d="M15 20L20 15L25 20L20 25L15 20Z" fill="#00D4AA"/>
  </svg>
)

// TokenPocket Icon
const TokenPocketIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#2980FE"/>
    <rect x="10" y="10" width="20" height="20" rx="4" fill="white"/>
    <rect x="14" y="14" width="5" height="12" rx="1" fill="#2980FE"/>
    <rect x="21" y="14" width="5" height="8" rx="1" fill="#2980FE"/>
  </svg>
)

// imToken Icon
const ImTokenIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#11C4D1"/>
    <circle cx="20" cy="20" r="12" fill="white"/>
    <path d="M20 12V28M14 16L20 12L26 16" stroke="#11C4D1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Safe (Gnosis Safe) Icon
const SafeIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#12FF80"/>
    <rect x="10" y="12" width="20" height="18" rx="2" fill="black"/>
    <rect x="12" y="14" width="16" height="14" rx="1" fill="#12FF80"/>
    <circle cx="20" cy="21" r="4" fill="black"/>
    <circle cx="20" cy="21" r="2" fill="#12FF80"/>
    <rect x="17" y="8" width="6" height="6" rx="1" fill="black"/>
  </svg>
)

// Zerion Icon
const ZerionIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#2962EF"/>
    <path d="M10 14H26L10 26H30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// 默认钱包 Icon
const DefaultWalletIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="url(#default-wallet-gradient)"/>
    <rect x="8" y="14" width="24" height="16" rx="2" fill="white"/>
    <rect x="8" y="14" width="24" height="5" fill="#E0E0E0"/>
    <circle cx="26" cy="23" r="2" fill="#667eea"/>
    <defs>
      <linearGradient id="default-wallet-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#667eea"/>
        <stop offset="1" stopColor="#764ba2"/>
      </linearGradient>
    </defs>
  </svg>
)

// 钱包图标映射
export const WalletIcons: Record<string, React.ReactElement> = {
  'metamask': <MetaMaskIcon />,
  'okx': <OKXIcon />,
  'okex': <OKXIcon />,
  'okex wallet': <OKXIcon />,
  'okx wallet': <OKXIcon />,
  'coinbase': <CoinbaseIcon />,
  'coinbase wallet': <CoinbaseIcon />,
  'trust': <TrustWalletIcon />,
  'trust wallet': <TrustWalletIcon />,
  'walletconnect': <WalletConnectIcon />,
  'rainbow': <RainbowIcon />,
  'phantom': <PhantomIcon />,
  'rabby': <RabbyIcon />,
  'rabby wallet': <RabbyIcon />,
  'bitget': <BitgetIcon />,
  'bitget wallet': <BitgetIcon />,
  'tokenpocket': <TokenPocketIcon />,
  'token pocket': <TokenPocketIcon />,
  'imtoken': <ImTokenIcon />,
  'safe': <SafeIcon />,
  'gnosis safe': <SafeIcon />,
  'zerion': <ZerionIcon />,
}

// 获取钱包图标
export const getWalletIcon = (walletName: string): React.ReactElement => {
  const normalizedName = walletName.toLowerCase().trim()
  
  // 精确匹配
  if (WalletIcons[normalizedName]) {
    return WalletIcons[normalizedName]
  }
  
  // 部分匹配
  for (const key of Object.keys(WalletIcons)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return WalletIcons[key]
    }
  }
  
  return <DefaultWalletIcon />
}
