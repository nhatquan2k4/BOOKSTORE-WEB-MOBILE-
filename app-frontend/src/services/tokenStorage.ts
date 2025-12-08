import * as SecureStore from 'expo-secure-store';
import { TokenData } from '@/src/types/auth';

const TOKEN_KEY = 'auth_tokens';

/**
 * Lưu tokens vào SecureStore (encrypted storage trên device)
 */
export async function saveTokens(tokenData: TokenData): Promise<void> {
  try {
    const jsonData = JSON.stringify(tokenData);
    await SecureStore.setItemAsync(TOKEN_KEY, jsonData);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw new Error('Không thể lưu thông tin đăng nhập');
  }
}

/**
 * Load tokens từ SecureStore
 */
export async function loadTokens(): Promise<TokenData | null> {
  try {
    const jsonData = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!jsonData) {
      return null;
    }
    return JSON.parse(jsonData) as TokenData;
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
}

/**
 * Xóa tokens khỏi SecureStore (khi logout)
 */
export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

/**
 * Kiểm tra xem access token còn hiệu lực không
 */
export function isTokenExpired(expiresAt: string): boolean {
  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    // Thêm buffer 5 phút để refresh trước khi hết hạn
    const bufferMs = 5 * 60 * 1000;
    return (expiryDate.getTime() - now.getTime()) < bufferMs;
  } catch {
    return true;
  }
}

/**
 * Lấy access token hiện tại (nếu còn hợp lệ)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  if (!tokens) {
    return null;
  }

  if (isTokenExpired(tokens.accessTokenExpiresAt)) {
    return null;
  }

  return tokens.accessToken;
}
