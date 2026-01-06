import axiosInstance from '@/lib/axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export const chatbotService = {
  sendMessage: async (message: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
    try {
      // Backend expects { message: string } and returns a string answer in the response body
      const payload = { message };

      const response = await axiosInstance.post<string>('/api/chatbot/ask', payload);

      // response.data is the string answer
      return response.data as unknown as string;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Không thể kết nối với trợ lý ảo. Vui lòng thử lại sau.');
    }
  }
};
