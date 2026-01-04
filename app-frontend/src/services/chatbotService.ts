// ChatBot Service - API calls for chatbot support
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  ChatBotAskRequest,
  ChatBotResponse,
  ChatBotCacheStatus,
} from '../types/chatbot';

/**
 * Ask chatbot a question
 */
export const askChatBot = async (message: string): Promise<string> => {
  try {
    console.log('🤖 Asking chatbot:', message);
    const request: ChatBotAskRequest = { message };
    const response = await api.post<ChatBotResponse>(API_ENDPOINTS.CHATBOT.ASK, request);
    console.log('✅ ChatBot response:', response);
    return response.answer || response as any; // Backend có thể trả về trực tiếp string
  } catch (error: any) {
    console.error('❌ Error asking chatbot:', error);
    throw error;
  }
};

/**
 * Get cache status (for admin)
 */
export const getCacheStatus = async (): Promise<ChatBotCacheStatus> => {
  try {
    const response = await api.get<ChatBotCacheStatus>(API_ENDPOINTS.CHATBOT.CACHE_STATUS);
    return response;
  } catch (error: any) {
    console.error('Error getting cache status:', error);
    throw error;
  }
};

/**
 * Refresh cache (admin only)
 */
export const refreshCache = async (): Promise<void> => {
  try {
    console.log('🔄 Refreshing chatbot cache...');
    await api.post(API_ENDPOINTS.CHATBOT.CACHE_REFRESH);
    console.log('✅ Cache refreshed');
  } catch (error: any) {
    console.error('Error refreshing cache:', error);
    throw error;
  }
};

export default {
  askChatBot,
  getCacheStatus,
  refreshCache,
};
