/**
 * Merge class names — simple alternative to clsx
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a Date or ISO string to a readable date
 */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...opts,
  }).format(new Date(dateStr));
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncate a string to maxLen with ellipsis
 */
export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
