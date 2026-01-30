// Format wallet address (0x1234...5678)
export const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format balance with precision
export const formatBalance = (balance: string) => {
  const num = parseFloat(balance)
  if (num === 0) return '0'
  if (num < 0.0001) return '< 0.0001'
  return num.toFixed(4).replace(/\.?0+$/, '')
}
