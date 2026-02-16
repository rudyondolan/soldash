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

export default function Home() {
  const { publicKey, balance, loading, error } = useSolBalance()

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg dark:bg-zinc-900 dark:shadow-zinc-800/40 p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Solana Dashboard</h1>

        <WalletMultiButton />

        {publicKey && (
          <div className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Wallet
            </p>
            <p className="text-sm font-mono break-all">
              {publicKey.toBase58()}
            </p>

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

