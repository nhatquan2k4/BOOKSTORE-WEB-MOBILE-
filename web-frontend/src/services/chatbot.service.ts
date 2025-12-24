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

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export const chatbotService = {
  sendMessage: async (message: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
    try {
      const response = await axiosInstance.post<ChatResponse>('/api/chatbot/chat', {
        message,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Không thể kết nối với trợ lý ảo. Vui lòng thử lại sau.');
    }
  }
};
