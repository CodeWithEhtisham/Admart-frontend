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
 * Derives a single uppercase initial for the avatar from the logged-in user.
 * Falls back through firstName → name → username → email, then to 'U'.
 */
export function getUserInitial() {
  const user = getStoredUser()
  const source =
    user.firstName ||
    user.first_name ||
    user.name ||
    user.username ||
    user.email ||
    ''
  const ch = String(source).trim().charAt(0)
  return ch ? ch.toUpperCase() : 'U'
}
