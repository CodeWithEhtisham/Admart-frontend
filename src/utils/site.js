/**
 * Public site details, set at build time (see .env.example). The staging/production
 * build refuses to run without VITE_SUPPORT_EMAIL, so legal pages always show a real
 * contact address.
 */
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ''
export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Admart'
// Registered address of the company (shown on legal pages; reviewers check it).
export const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_ADDRESS || ''
export const LEGAL_LAST_UPDATED = '14 October 2026'

// Landing page sections, in nav order (the landing page highlights the one in view).
export const SECTIONS = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'faq', label: 'FAQ' },
]
