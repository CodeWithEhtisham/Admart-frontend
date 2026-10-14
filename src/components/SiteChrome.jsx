import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import { SECTIONS, SUPPORT_EMAIL } from '../utils/site'
import BrandGlyph from './BrandGlyph'

// The public site's look (black, glows, pill buttons), shared by the landing, legal and blog pages.

export function LogoMark({ className = '' }) {
  return (
    <Link to="/" aria-label="Admart home" className={`flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg font-heading text-lg font-bold text-white shadow-lg gradient-glow">
        <BrandGlyph />
      </span>
      <span aria-hidden className="font-heading text-xl font-semibold tracking-tight text-white">
        Admart
      </span>
    </Link>
  )
}

export function PillButton({ children, variant = 'primary', className = '', ...props }) {
  if (variant === 'ring') {
    return (
      <span className={`inline-flex w-fit transition-transform duration-300 ease-out active:scale-95 ${className}`}>
        <a
          {...props}
          className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors duration-300"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.35) 0deg, rgba(255,255,255,0.05) 90deg, rgba(255,255,255,0.35) 180deg, rgba(255,255,255,0.05) 270deg, rgba(255,255,255,0.35) 360deg)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '2px',
            }}
            aria-hidden
          />
          <span className="relative z-10">{children}</span>
        </a>
      </span>
    )
  }
  return (
    <span className={`inline-flex w-fit transition-transform duration-300 ease-out active:scale-95 ${className}`}>
      <a
        {...props}
        className="inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-[#ededed]"
      >
        {children}
      </a>
    </span>
  )
}

const linkClass = 'inline-block py-1 text-sm text-white/70 transition hover:text-white'

/** In-app routes use <Link>; anchors ("/#pricing") and mailto use <a> so the browser scrolls/opens them. */
function SiteLink({ href, className = linkClass, children }) {
  return href.startsWith('/') && !href.includes('#') ? (
    <Link to={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

const navClass = (on) =>
  `inline-block py-1.5 text-sm transition duration-300 ${
    on ? 'font-semibold text-[#3B82F6] [text-shadow:0_0_14px_rgba(59,130,246,0.75)]' : 'text-white/80 hover:text-white'
  }`

/** The public site header: transparent over the hero, blurred once you scroll. `base` is "/" off the landing page. */
export function SiteHeader({ active = '', base = '/' }) {
  const authenticated = isAuthenticated()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        scrolled ? 'bg-black/70 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-6 xl:px-10">
        <LogoMark />
        <nav aria-label="Site" className="hidden items-center gap-8 xl:flex">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`${base === '/' ? '/' : ''}#${s.id}`} aria-current={active === s.id ? 'true' : undefined} className={navClass(active === s.id)}>
              {s.label}
            </a>
          ))}
          <Link to="/blog" aria-current={active === 'blog' ? 'true' : undefined} className={navClass(active === 'blog')}>
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {authenticated ? (
            <PillButton href="/dashboard" variant="ring">
              Go to Dashboard
            </PillButton>
          ) : (
            <>
              <PillButton href="/auth" variant="ring" className="hidden sm:inline-flex">
                Log in
              </PillButton>
              <PillButton href="/auth">Get Started Free</PillButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/** The landing hero's look for other pages: grey-to-black wash, blue and violet glows, huge uppercase title. */
export function PageHero({ eyebrow, title, accent, sub, children }) {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-3 pb-16 pt-32 text-center sm:pt-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(169.74deg, #0a0a0a 0%, rgba(37,37,37,0.65) 100%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: 'rgba(59,130,246,0.12)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{ background: 'rgba(139,92,246,0.10)' }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" aria-hidden />
      <div className="relative z-10 flex w-full flex-col items-center">
        {eyebrow ? (
          <p className="mb-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#22C55E' }} aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-[16em] font-heading font-bold uppercase leading-[1.02] tracking-tight text-white text-[clamp(2rem,5.5vw,4.8rem)]">
          {title}
          {accent ? (
            <>
              {' '}
              <span className="gradient-text">{accent}</span>
            </>
          ) : null}
        </h1>
        {sub ? <p className="mx-auto mt-5 max-w-[52em] text-[1rem] font-medium text-white/75 sm:text-lg">{sub}</p> : null}
        {children}
      </div>
    </section>
  )
}

/** The landing page's closing call to action, without the background video. */
export function CtaBand({ title, accent, sub, children }) {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-3 py-24 text-center sm:px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
        style={{ background: 'rgba(139,92,246,0.14)' }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-white text-[clamp(2rem,6vw,4.5rem)]">
          {title} {accent ? <span className="gradient-text">{accent}</span> : null}
        </h2>
        {sub ? <p className="mx-auto mt-6 max-w-[40em] text-sm font-medium text-white/80 sm:text-[1rem]">{sub}</p> : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">{children}</div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-black px-3 pb-4 pt-8 text-white sm:px-6 xl:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LogoMark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Your AI social media handler — professional AI images and videos, published wherever
            and whenever you want.
          </p>
        </div>
        {/* Only links that lead somewhere real. */}
        {[
          {
            heading: 'Product',
            links: [
              ['Features', '/#features'],
              ['Pricing', '/#pricing'],
              ['Examples', '/#showcase'],
              ['FAQ', '/#faq'],
              ['Blog', '/blog'],
            ],
          },
          {
            heading: 'Legal',
            links: [
              ['Privacy Policy', '/privacy'],
              ['Terms of Service', '/terms'],
              ['Data deletion', '/privacy#data-deletion'],
            ],
          },
          {
            heading: 'Support',
            links: SUPPORT_EMAIL ? [['Email us', `mailto:${SUPPORT_EMAIL}`]] : [],
          },
        ].map((col) => (
          <div key={col.heading}>
            <h3 className="font-heading text-sm font-bold uppercase text-white">{col.heading}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <SiteLink href={href}>{label}</SiteLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-[1600px] flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
        <p className="text-xs text-white/70">© 2026 Admart. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="inline-block py-1.5 text-xs text-white/70 transition hover:text-white">
            Privacy
          </Link>
          <Link to="/terms" className="inline-block py-1.5 text-xs text-white/70 transition hover:text-white">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
