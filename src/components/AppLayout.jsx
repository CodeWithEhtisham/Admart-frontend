import AdmartSidebar from './AdmartSidebar'
import { useAppChrome } from '../utils/appChrome'

/**
 * Shared shell for all authenticated in-app pages.
 * Renders the single AdmartSidebar and shifts page content to match the
 * sidebar's collapsed/expanded width. Page-specific header + main go in
 * as `children`.
 */
export default function AppLayout({ children }) {
  const { collapsed } = useAppChrome()

  return (
    <div className="min-h-screen bg-base font-body text-base text-text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-accent-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <AdmartSidebar />
      <div
        className={`min-h-screen transition-[margin] duration-300 ease-out ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
