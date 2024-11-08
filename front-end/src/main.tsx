// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'

import { SolanaWalletProvider } from './components/solana/SolanaProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/ui/ToastProvider'

import './index.css'

// Polyfill Buffer and process
import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = Buffer as any
window.process = process as any

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SolanaWalletProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
