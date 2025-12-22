import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { BookImage } from '../types';

class BookImageService {
    async upload(bookId: string, formData: FormData) {
        const response = await apiClient.post<BookImage>(
            API_ENDPOINTS.BOOK_IMAGES.UPLOAD(bookId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async getByBookId(bookId: string) {
        const response = await apiClient.get<BookImage[]>(
            API_ENDPOINTS.BOOK_IMAGES.GET_BY_BOOK(bookId)
        );
        return response.data;
    }

    async delete(bookId: string, imageId: string) {
        const response = await apiClient.delete(
            API_ENDPOINTS.BOOK_IMAGES.DELETE(bookId, imageId)
        );
        return response.data;
    }

    async setPrimary(bookId: string, imageId: string) {
        const response = await apiClient.put(
            API_ENDPOINTS.BOOK_IMAGES.SET_PRIMARY(bookId, imageId)
        );
        return response.data;
    }
}

export default new BookImageService();
