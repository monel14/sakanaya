/**
 * Utility functions for formatting numbers, currency, and other data types
 */

/**
 * Format a number as CFA currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('XOF', 'CFA');
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a date in French format
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR');
};

/**
 * Format a date with time in French format
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('fr-FR');
};

/**
 * Format a quantity with appropriate unit
 */
export const formatQuantity = (quantity: number, unit: string): string => {
  const formattedQuantity = unit === 'kg' ? formatNumber(quantity, 2) : formatNumber(quantity, 0);
  return `${formattedQuantity} ${unit}`;
};

/**
 * Format a compact number (K, M, etc.)
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
};

/**
 * Format a duration in days/hours/minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
};

/**
 * Format a file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Senegalese phone number
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('221')) {
    return `+221 ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10)}`;
  }
  
  return phone; // Return original if format not recognized
};