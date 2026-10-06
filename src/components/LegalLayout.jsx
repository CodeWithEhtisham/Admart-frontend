import { Link } from 'react-router-dom'
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from '../utils/site'

/** Shared shell for public legal pages (Privacy, Terms). */
export default function LegalLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Admart home">
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg font-heading font-bold text-white">
              A
            </span>
            <span aria-hidden className="font-heading text-lg font-semibold">Admart</span>
          </Link>
          <nav aria-label="Legal" className="flex gap-4 text-sm">
            <Link to="/privacy" className="text-text-secondary hover:text-text-primary">Privacy</Link>
            <Link to="/terms" className="text-text-secondary hover:text-text-primary">Terms</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-text-tertiary">Last updated: {LEGAL_LAST_UPDATED}</p>
        <div className="legal mt-8 space-y-8 text-[15px] leading-relaxed text-text-secondary [&_a]:text-link [&_a]:underline [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text-primary [&_li]:ml-5 [&_li]:list-disc [&_li]:mt-1.5 [&_strong]:text-text-primary">
          {children}
        </div>
        <p className="mt-12 border-t border-border pt-6 text-sm text-text-tertiary">
          Questions? Contact us at <ContactEmail />.
        </p>
      </main>
    </div>
  )
}

export function ContactEmail() {
  return SUPPORT_EMAIL ? <a href={`mailto:${SUPPORT_EMAIL}`} className="text-link underline">{SUPPORT_EMAIL}</a> : <span>our support team</span>
}

/** Bracketed text the owner must replace before launch (legal entity, governing law...). */
export function Fill({ children }) {
  return <mark className="rounded bg-warning/20 px-1 text-text-primary">[{children}]</mark>
}
