import { formatDistanceToNow } from "date-fns"

export function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  return formatDistanceToNow(date, { addSuffix: true })
}

export function getInitials(displayName: string): string {
  const words = displayName.split(' ');
  const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
  return initials;
}
