// src/components/solana/solana-provider.tsx
import React, { FC, ReactNode, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  // Add other wallet adapters if needed
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl, Cluster } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaWalletProviderProps {
  children: ReactNode
  network?: Cluster
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({
  children,
  network = 'devnet',
}) => {
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add other wallet adapters here
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

