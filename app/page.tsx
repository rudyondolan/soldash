'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

export default function Home() {
  const { publicKey } = useWallet()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Solana Dashboard</h1>
      <WalletMultiButton />
      {publicKey && (
        <p className="text-sm">
          Connected: {publicKey.toBase58()}
        </p>
      )}
    </main>
  )
}
