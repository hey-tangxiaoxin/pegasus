// Polyfill Node Buffer for browser (ethers / Solana deps)
import { Buffer } from 'buffer'
if (typeof globalThis.Buffer === 'undefined') {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { NetworksProvider } from './contexts/NetworksContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworksProvider>
      <App />
    </NetworksProvider>
  </StrictMode>,
)
