/**
 * Format numerical amount into standard localized currency string
 * e.g. 1250.5 -> "$1,250.50"
 */
export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format an ISO string or date into human-readable format
 * e.g. "2026-10-05T12:00:00.000Z" -> "Oct 5, 2026"
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Convert ISO date to YYYY-MM-DD for HTML input[type="date"]
 */
export function toInputDateFormat(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}

/**
 * Format percentage value cleanly
 * e.g. 56.6666 -> "56.7%"
 */
export function formatPercentage(val, decimals = 1) {
  const num = Number(val);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format Month and Year
 * e.g. (10, 2026) -> "October 2026"
 */
export function formatMonthYear(month, year) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mName = monthNames[Number(month) - 1] || '';
  return `${mName} ${year}`;
}
