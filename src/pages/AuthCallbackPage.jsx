import { AuthenticateWithRedirectCallback } from '@clerk/react'

/**
 * Landing target for Clerk's OAuth redirect flow (Google sign-in).
 * <AuthenticateWithRedirectCallback /> completes the handshake and
 * redirects the user to the original destination.
 */
export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 font-body text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center shadow-xl">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-violet border-t-transparent" />
        <h1 className="mt-6 font-heading text-xl font-bold">Completing sign-in...</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Please wait while we finish setting up your session.
        </p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  )
}
