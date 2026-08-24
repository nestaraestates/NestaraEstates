export const SUPER_ADMIN_EMAILS = [
  'nestaraestates@gmail.com',
  'vineethbpawar@gmail.com'
]

export function isSuperAdmin(email?: string | null) {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
}
