import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { Toaster } from '@/components/ui/sonner'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
      <Toaster />
    </AppProviders>
  </StrictMode>,
)
