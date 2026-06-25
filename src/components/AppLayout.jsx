import VidifySidebar from './VidifySidebar'
import { useAppChrome } from '../utils/appChrome'

/**
 * Shared shell for all authenticated in-app pages.
 * Renders the single VidifySidebar and shifts page content to match the
 * sidebar's collapsed/expanded width. Page-specific header + main go in
 * as `children`.
 */
export default function AppLayout({ children }) {
  const { collapsed } = useAppChrome()

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div
        className={`min-h-screen transition-[margin] duration-300 ease-out ${
          collapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
