/**
 * 非 EVM 钱包连接（Solana / Bitcoin），纯逻辑无 UI，便于复用与测试。
 */
import { Connection, PublicKey } from '@solana/web3.js'

const SOLANA_RPC = 'https://solana.publicnode.com'
const LAMPORTS_PER_SOL = 1e9
const MEMPOOL_API = 'https://mempool.space/api'

export interface SolanaAccountData {
  publicKey: string
  balance: string
}

export interface BitcoinAccountData {
  address: string
  balance: string
}

declare global {
  interface Window {
    solana?: { connect: () => Promise<{ publicKey: { toBase58: () => string } }> }
    unisat?: { requestAccounts: () => Promise<string[]> }
  }
}

/** 尝试连接 Solana 钱包并拉取余额，失败返回 null */
export async function connectSolana(): Promise<SolanaAccountData | null> {
  if (typeof window === 'undefined' || !window.solana) return null
  try {
    const { publicKey } = await window.solana.connect()
    const pubkey = publicKey.toBase58()
    const connection = new Connection(SOLANA_RPC)
    const balance = await connection.getBalance(new PublicKey(pubkey))
    const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(9)
    return { publicKey: pubkey, balance: solBalance }
  } catch {
    return null
  }
}

/** 尝试连接 Bitcoin 钱包并拉取余额，失败返回 null */
export async function connectBitcoin(): Promise<BitcoinAccountData | null> {
  if (typeof window === 'undefined' || !window.unisat) return null
  try {
    const accounts = await window.unisat.requestAccounts()
    const address = accounts?.[0]
    if (!address) return null
    const res = await fetch(`${MEMPOOL_API}/address/${address}`)
    if (!res.ok) return null
    const data = (await res.json()) as { chain_stats?: { funded_txo_sum: number; spent_txo_sum: number } }
    const funded = data?.chain_stats?.funded_txo_sum ?? 0
    const spent = data?.chain_stats?.spent_txo_sum ?? 0
    const sats = Math.max(0, funded - spent)
    const balance = (sats / 1e8).toFixed(8)
    return { address, balance }
  } catch {
    return null
  }
}
