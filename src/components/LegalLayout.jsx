import { useEffect, useRef, useState } from 'react'
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from '../utils/site'
import { CtaBand, PageHero, PillButton, SiteFooter, SiteHeader } from './SiteChrome'

// Long text on the black site, sized like the landing page (also used by blog posts).
export const PROSE =
  'text-[1rem] leading-relaxed text-white/75 [&_a]:text-[#60A5FA] [&_a]:underline [&_a:hover]:text-white [&_blockquote]:border-l-2 [&_blockquote]:border-[#3B82F6] [&_blockquote]:pl-5 [&_blockquote]:text-white [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-white sm:[&_h2]:text-3xl [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_img]:w-full [&_img]:rounded-lg [&_li]:ml-5 [&_li]:mt-2 [&_li]:pl-1 [&_ol]:list-decimal [&_strong]:font-semibold [&_strong]:text-white [&_ul]:list-disc [&_li]:marker:text-[#3B82F6]'

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Sections of the page (a <section> with an <h2>), with ids for links; highlights the one in view. */
function useSections(ref) {
  const [sections, setSections] = useState([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const found = [...ref.current.querySelectorAll(':scope > section')]
      .map((el) => {
        const heading = el.querySelector('h2')
        if (!heading) return null
        el.id ||= slug(heading.textContent)
        return { id: el.id, label: heading.textContent, el }
      })
      .filter(Boolean)
    setSections(found.map(({ id, label }) => ({ id, label })))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -65% 0px', threshold: 0 },
    )
    found.forEach((s) => io.observe(s.el))
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    return () => io.disconnect()
  }, [ref])

  return [sections, active]
}

/** Public legal pages (Privacy, Terms) in the landing page's look. */
export default function LegalLayout({ title, accent, sub, children }) {
  const body = useRef(null)
  const [sections, active] = useSections(body)

  return (
    <div className="min-h-screen overflow-x-clip bg-black font-body text-white">
      <SiteHeader />
      <main id="main-content">
        <PageHero eyebrow={`Last updated: ${LEGAL_LAST_UPDATED}`} title={title} accent={accent} sub={sub} />

        <div className="mx-auto grid max-w-[1200px] gap-12 px-3 pb-8 pt-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/50">On this page</p>
              <ol className="space-y-1 border-l border-white/15">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? 'true' : undefined}
                      className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition duration-300 ${
                        active === s.id
                          ? 'border-[#3B82F6] font-semibold text-[#3B82F6] [text-shadow:0_0_14px_rgba(59,130,246,0.6)]'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="mr-2 font-mono text-xs text-white/40">{String(i + 1).padStart(2, '0')}</span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div
            ref={body}
            className={`${PROSE} [&>section]:scroll-mt-24 [&>section]:border-b [&>section]:border-white/20 [&>section]:py-10 [&>section:first-child]:pt-0 [&>section:last-child]:border-b-0`}
          >
            {children}
          </div>
        </div>

        <CtaBand
          title="Questions?"
          accent="We're here."
          sub="Write to us about your data, your account or these terms."
        >
          {SUPPORT_EMAIL ? (
            <PillButton href={`mailto:${SUPPORT_EMAIL}`} className="!px-8 !py-4 text-[1rem]">
              Email {SUPPORT_EMAIL}
            </PillButton>
          ) : null}
          <PillButton href="/" variant="ring" className="!px-8 !py-4 text-[1rem]">
            Back to home
          </PillButton>
        </CtaBand>
      </main>
      <SiteFooter />
    </div>
  )
}

export function ContactEmail() {
  return SUPPORT_EMAIL ? (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#60A5FA] underline hover:text-white">
      {SUPPORT_EMAIL}
    </a>
  ) : (
    <span>our support team</span>
  )
}

/** Bracketed text the owner must replace before launch (legal entity, governing law...). */
export function Fill({ children }) {
  return <mark className="rounded bg-[#EAB308]/25 px-1 text-white">[{children}]</mark>
}
