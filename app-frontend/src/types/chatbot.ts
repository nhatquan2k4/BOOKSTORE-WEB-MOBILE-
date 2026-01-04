// ChatBot Types

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * ChatBot ask request
 */
export interface ChatBotAskRequest {
  message: string;
}

/**
 * ChatBot response
 */
export interface ChatBotResponse {
  answer: string;
  timestamp?: string;
}

/**
 * Cache status response
 */
export interface ChatBotCacheStatus {
  isCacheLoaded: boolean;
  bookCount: number;
  categoryCount: number;
}

/**
 * Cached book info
 */
export interface CachedBook {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  authors: string[];
  categories: string[];
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  pageCount?: number;
  language?: string;
  stockQuantity: number;
  imageUrl?: string;
  searchText: string;
}

/**
 * Cached category info
 */
export interface CachedCategory {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
}
