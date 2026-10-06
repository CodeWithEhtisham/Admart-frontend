/**
 * Shared outline icon wrapper (24px / 1.75 stroke, same as the sidebar). Use with
 * the paths in ./glyphs instead of emoji, so icons look consistent and screen
 * readers skip them:
 *   <Icon className="h-4 w-4">{Glyphs.bolt}</Icon>
 */
export function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}
