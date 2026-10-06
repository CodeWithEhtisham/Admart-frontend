/**
 * Public site details, set at build time (see .env.example). The staging/production
 * build refuses to run without VITE_SUPPORT_EMAIL, so legal pages always show a real
 * contact address.
 */
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ''
export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Admart'
export const LEGAL_LAST_UPDATED = '6 October 2026'
