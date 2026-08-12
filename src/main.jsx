import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { applyTheme, getTheme } from './utils/appChrome'

applyTheme(getTheme())

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const root = createRoot(document.getElementById('root'))

const missingClerkKey = (
  <div className="flex min-h-screen items-center justify-center bg-base px-6 font-body text-text-primary">
    <div className="max-w-md rounded-2xl border border-border-default bg-panel p-8 shadow-xl">
      <p className="font-heading text-xl font-bold">Clerk is not configured</p>
      <p className="mt-3 text-sm text-text-secondary">
        Add VITE_CLERK_PUBLISHABLE_KEY to the frontend environment and restart the dev server.
      </p>
    </div>
  </div>
)

root.render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/auth"
        signUpUrl="/auth?mode=sign-up"
        afterSignOutUrl="/"
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : missingClerkKey}
  </StrictMode>,
)
