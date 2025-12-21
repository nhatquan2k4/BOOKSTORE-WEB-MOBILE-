import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { Book, BookDetail } from '../types';

interface BookListResponse {
    items: Book[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

class BookService {
    async getAll(params?: { 
        page?: number; 
        pageSize?: number; 
        search?: string;
        authorId?: string;
        categoryId?: string;
        publisherId?: string;
        isAvailable?: boolean;
    }) {
        // Map frontend params to backend API params
        const apiParams = {
            pageNumber: params?.page || 1,
            pageSize: params?.pageSize || 10,
            searchTerm: params?.search || undefined,
            authorId: params?.authorId || undefined,
            categoryId: params?.categoryId || undefined,
            publisherId: params?.publisherId || undefined,
            isAvailable: params?.isAvailable
        };
        const response = await apiClient.get<BookListResponse>(API_ENDPOINTS.BOOK.LIST, { 
            params: apiParams 
        });
        return response.data;
    }

    async getById(id: string) {
        const response = await apiClient.get<BookDetail>(API_ENDPOINTS.BOOK.GET_BY_ID(id));
        return response.data;
    }

    async create(book: any) {
        const response = await apiClient.post<BookDetail>(API_ENDPOINTS.BOOK.CREATE, book);
        return response.data;
    }

    async update(id: string, book: Partial<Book>) {
        const response = await apiClient.put<BookDetail>(API_ENDPOINTS.BOOK.UPDATE(id), book);
        return response.data;
    }

    async delete(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.BOOK.DELETE(id));
        return response.data;
    }

    async updatePrice(id: string, price: number) {
        const response = await apiClient.patch(`/Book/${id}/price`, {
            Price: price,
            EffectiveTo: null
        });
        return response.data;
    }

    async search(query: string) {
        const response = await apiClient.get<BookListResponse>(API_ENDPOINTS.BOOK.SEARCH, {
            params: { q: query },
        });
        return response.data;
    }
}

export default new BookService();
