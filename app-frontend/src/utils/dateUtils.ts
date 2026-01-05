/**
 * Date Utilities
 * Handle timezone conversions and date formatting
 */

// Vietnam timezone offset (UTC+7)
export const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

/**
 * Convert UTC date string from backend to local Vietnam time
 */
export const parseUTCToVietnamTime = (utcDateString: string): Date => {
  // Ensure the string has timezone indicator
  let dateString = utcDateString;
  
  // If string doesn't end with 'Z' and doesn't have timezone offset, add 'Z'
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('T')) {
    // Format: "2026-01-05 07:30:00" -> "2026-01-05T07:30:00Z"
    dateString = dateString.replace(' ', 'T') + 'Z';
  } else if (!dateString.endsWith('Z') && dateString.includes('T') && !dateString.includes('+')) {
    // Format: "2026-01-05T07:30:00" -> "2026-01-05T07:30:00Z"
    dateString = dateString + 'Z';
  }
  
  const utcDate = new Date(dateString);
  
  // Debug log
  console.log('📅 Parse UTC:', {
    input: utcDateString,
    processed: dateString,
    parsed: utcDate.toISOString(),
    local: utcDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  
  return utcDate;
};

/**
 * Format date to Vietnamese format
 * @param date - Date object to format
 * @param includeTime - Whether to include time (HH:mm)
 */
export const formatVietnameseDate = (date: Date, includeTime: boolean = true): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }
  
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

/**
 * Format relative time (e.g., "5 phút trước", "2 giờ trước")
 * @param date - Date to compare with current time
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Nếu thời gian trong tương lai (có thể do sai timezone), hiển thị "Vừa xong"
  if (diff < 0) return 'Vừa xong';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) return 'Vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 4) return `${weeks} tuần trước`;
  if (months < 12) return `${months} tháng trước`;
  return `${years} năm trước`;
};

/**
 * Format time with smart display:
 * - Less than 7 days: relative time
 * - 7 days or more: absolute date/time
 */
export const formatSmartTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  
  if (days < 7) {
    return formatRelativeTime(date);
  }
  
  return formatVietnameseDate(date, true);
};

/**
 * Get day of week in Vietnamese
 */
export const getVietnameseDayOfWeek = (date: Date): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[date.getDay()];
};

/**
 * Format full Vietnamese date with day of week
 * Example: "Thứ Hai, 05/01/2026 14:30"
 */
export const formatFullVietnameseDate = (date: Date): string => {
  const dayOfWeek = getVietnameseDayOfWeek(date);
  const dateStr = formatVietnameseDate(date, true);
  return `${dayOfWeek}, ${dateStr}`;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

/**
 * Format time with "Today", "Yesterday" labels
 * Example: "Hôm nay 14:30", "Hôm qua 09:15", "03/01/2026 10:00"
 */
export const formatTimeWithTodayYesterday = (date: Date): string => {
  if (isToday(date)) {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `Hôm nay ${hour}:${minute}`;
  }
  
  if (isYesterday(date)) {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `Hôm qua ${hour}:${minute}`;
  }
  
  return formatVietnameseDate(date, true);
};

/**
 * Get current Vietnam time
 */
export const getCurrentVietnamTime = (): Date => {
  return new Date();
};

/**
 * Debug function to log date info
 */
export const debugDate = (date: Date, label: string = 'Date'): void => {
  console.log(`📅 ${label}:`, {
    ISO: date.toISOString(),
    Local: date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    Timestamp: date.getTime(),
    Formatted: formatVietnameseDate(date),
    Relative: formatRelativeTime(date),
  });
};

export default {
  parseUTCToVietnamTime,
  formatVietnameseDate,
  formatRelativeTime,
  formatSmartTime,
  getVietnameseDayOfWeek,
  formatFullVietnameseDate,
  isToday,
  isYesterday,
  formatTimeWithTodayYesterday,
  getCurrentVietnamTime,
  debugDate,
};
