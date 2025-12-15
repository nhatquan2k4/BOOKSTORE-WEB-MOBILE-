/**
 * Text Utility Functions
 * Xử lý chuẩn hóa văn bản, đặc biệt cho tiếng Việt
 */

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu sang không dấu
 * Sử dụng trong tìm kiếm để hỗ trợ user gõ không dấu
 * 
 * @param str - Chuỗi cần chuyển đổi
 * @returns Chuỗi không dấu, viết thường
 * 
 * @example
 * removeVietnameseAccents("Đắc Nhân Tâm") // "dac nhan tam"
 * removeVietnameseAccents("Tuổi Trẻ Đáng Giá Bao Nhiêu") // "tuoi tre dang gia bao nhieu"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  
  // Normalize Unicode về dạng NFD (tách ký tự gốc và dấu riêng)
  str = str.normalize('NFD');
  
  // Loại bỏ các dấu thanh (combining diacritical marks)
  str = str.replace(/[\u0300-\u036f]/g, '');
  
  // Xử lý các ký tự đặc biệt của tiếng Việt
  str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  
  // Chuyển về lowercase và trim
  return str.toLowerCase().trim();
}

/**
 * Kiểm tra xem chuỗi text có chứa chuỗi search hay không (không phân biệt dấu)
 * 
 * @param text - Chuỗi cần tìm kiếm trong đó
 * @param search - Chuỗi tìm kiếm
 * @returns true nếu tìm thấy
 * 
 * @example
 * matchVietnameseText("Đắc Nhân Tâm", "dac nhan") // true
 * matchVietnameseText("Tuổi Trẻ", "tuoi tre") // true
 * matchVietnameseText("Nguyễn Du", "nguyen du") // true
 */
export function matchVietnameseText(text: string, search: string): boolean {
  if (!text || !search) return false;
  
  const normalizedText = removeVietnameseAccents(text);
  const normalizedSearch = removeVietnameseAccents(search);
  
  return normalizedText.includes(normalizedSearch);
}

/**
 * Highlight text tìm thấy trong chuỗi (case-insensitive, accent-insensitive)
 * Trả về array các phần text để render với highlight
 * 
 * @param text - Chuỗi gốc
 * @param search - Chuỗi tìm kiếm
 * @returns Array các phần text {text, highlight}
 */
export function highlightVietnameseText(
  text: string,
  search: string
): { text: string; highlight: boolean }[] {
  if (!search || !text) {
    return [{ text, highlight: false }];
  }

  const normalizedText = removeVietnameseAccents(text);
  const normalizedSearch = removeVietnameseAccents(search);

  const index = normalizedText.indexOf(normalizedSearch);
  
  if (index === -1) {
    return [{ text, highlight: false }];
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + search.length);
  const after = text.substring(index + search.length);

  return [
    { text: before, highlight: false },
    { text: match, highlight: true },
    { text: after, highlight: false },
  ].filter(part => part.text.length > 0);
}

/**
 * So sánh 2 chuỗi tiếng Việt (không phân biệt dấu, hoa/thường)
 * 
 * @param str1 - Chuỗi 1
 * @param str2 - Chuỗi 2
 * @returns true nếu 2 chuỗi giống nhau
 */
export function equalVietnameseText(str1: string, str2: string): boolean {
  return removeVietnameseAccents(str1) === removeVietnameseAccents(str2);
}

/**
 * Truncate text với dấu ba chấm
 * 
 * @param text - Chuỗi cần cắt
 * @param maxLength - Độ dài tối đa
 * @returns Chuỗi đã cắt
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize mỗi từ trong chuỗi
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}
