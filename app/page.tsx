'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function Home() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!publicKey) return
    connection.getBalance(publicKey).then((balance) => {
      setBalance(balance)
    })
  }, [publicKey, connection])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Solana Dashboard</h1>
      <WalletMultiButton />
      {publicKey && (
        <p className="text-sm">
          Connected: {publicKey.toBase58()}
        </p>
      )}
      {balance && (
        <p className="text-sm">
          Balance: {balance / LAMPORTS_PER_SOL} SOL
        </p>
      )}
    </main>
  )
}
