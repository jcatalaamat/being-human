const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Format: "Mon, Jan 15"
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

/**
 * Format: "Jan 15, 2025"
 */
export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/**
 * Format: "3:30 PM"
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

/**
 * Format: "Mon, Jan 15 at 3:30 PM"
 */
export function formatDateTime(dateStr: string): string {
  return `${formatShortDate(dateStr)} at ${formatTime(dateStr)}`
}

/**
 * Format: "Today", "Yesterday", "3 days ago", or "Jan 15"
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  // Reset time to midnight for comparison
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = today.getTime() - dateDay.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`

  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

/**
 * Format: "2025-01-15 19:00" (for form inputs)
 */
export function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * Get days difference from now (positive = future, negative = past)
 */
export function getDaysDifference(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()

  // Reset time to midnight for comparison
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = dateDay.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format: "Unlocks in 3 days" or "Unlocks on Jan 15"
 */
export function formatUnlockDate(dateStr: string): string {
  const days = getDaysDifference(dateStr)

  if (days <= 0) return 'Available now'
  if (days === 1) return 'Unlocks tomorrow'
  if (days <= 7) return `Unlocks in ${days} days`

  const date = new Date(dateStr)
  return `Unlocks on ${MONTHS[date.getMonth()]} ${date.getDate()}`
}
