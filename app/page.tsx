'use client'

import dynamic from 'next/dynamic'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

function useSolBalance() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRef = useRef(false)

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return

    activeRef.current = true
    setLoading(true)
    setError(null)

    try {
      const bal = await connection.getBalance(publicKey)
      if (activeRef.current) setBalance(bal)
    } catch (err: unknown) {
      if (activeRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance')
      }
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [publicKey, connection])

  useEffect(() => {
    fetchBalance()
    return () => { activeRef.current = false }
  }, [fetchBalance])

  // Derived: reset when wallet disconnects (no setState in effect)
  const connected = !!publicKey
  const displayBalance = connected ? balance : null
  const displayError = connected ? error : null
  const displayLoading = connected ? loading : false

  return { publicKey, balance: displayBalance, loading: displayLoading, error: displayError }
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-3)}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      title="Copy address"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

export default function Home() {
  const { publicKey, balance, loading, error } = useSolBalance()

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-lg dark:bg-zinc-900 dark:shadow-zinc-800/40 p-8 flex flex-col items-center gap-6">
        <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          Devnet
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Solana Dashboard</h1>

        <WalletMultiButton />

        {publicKey && (
          <div className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Wallet
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono">
                {shortenAddress(publicKey.toBase58())}
              </p>
              <CopyButton text={publicKey.toBase58()} />
            </div>

            <hr className="border-zinc-200 dark:border-zinc-700" />

            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Balance
            </p>

            {loading && (
              <p className="text-sm text-zinc-400 animate-pulse">Loading…</p>
            )}

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && balance !== null && (
              <p className="text-2xl font-semibold">
                {(balance / LAMPORTS_PER_SOL).toFixed(4)}{' '}
                <span className="text-base font-normal text-zinc-500">SOL</span>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

