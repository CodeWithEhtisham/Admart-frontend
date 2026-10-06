/** Returns the stored user object from localStorage, or an empty object. */
export function getStoredUser() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}') || {}
  } catch {
    return {}
  }
}

/**
 * Avatar initials, used everywhere the user is shown as letters: first + last
 * initial, else the first two letters of the name or email, else 'U'.
 */
export function initialsFor(user) {
  const first = user?.firstName || user?.first_name || ''
  const last = user?.lastName || user?.last_name || ''
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  const source = first || user?.name || user?.username || user?.email || ''
  return String(source).trim().slice(0, 2).toUpperCase() || 'U'
}
