// ERC20 合约 ABI
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  // 使用无返回值的 transfer，兼容 USDT 等不返回 bool 的合约，避免 "could not decode result data"
  'function transfer(address to, uint256 value)',
]
