// Stock Service - API calls for inventory/stock management
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { StockItem, StockAvailability } from '../types/stock';

/**
 * Get stock information by book ID
 * Returns array of stock items across all warehouses
 * Returns null if 404 (no stock data), empty array if other errors
 */
export const getStockByBookId = async (bookId: string): Promise<StockItem[] | null> => {
  try {
    const response = await api.get<any>(API_ENDPOINTS.STOCK.BY_BOOK_ID(bookId));
    
    console.log('📦 Stock API response type:', typeof response);
    console.log('📦 Response is array?', Array.isArray(response));
    
    // Backend Stock API returns array directly, not wrapped
    // But some other APIs return { success, data }
    // So check both formats
    if (Array.isArray(response)) {
      console.log(`✅ Got ${response.length} stock items for book ${bookId}`);
      if (response.length > 0) {
        console.log('📊 Stock details:', {
          quantityOnHand: response[0].quantityOnHand,
          reservedQuantity: response[0].reservedQuantity,
          availableQuantity: response[0].quantityOnHand - response[0].reservedQuantity
        });
      }
      return response as StockItem[];
    } else if (response?.data && Array.isArray(response.data)) {
      console.log(`✅ Got ${response.data.length} stock items (wrapped) for book ${bookId}`);
      return response.data as StockItem[];
    } else {
      console.warn('⚠️ Unexpected stock response format:', response);
      return [];
    }
  } catch (error: any) {
    // Check if 404 - means no stock data exists yet
    if (error?.response?.status === 404) {
      console.log(`ℹ️ No stock data for book ${bookId} (404 - not yet in inventory)`);
      return null; // null = chưa có data, khác với [] = có data nhưng empty
    }
    
    console.error(`❌ Error fetching stock for book ${bookId}:`, error?.message || error);
    // Return empty array for other errors
    return [];
  }
};

/**
 * Get available quantity for a book (total across all warehouses)
 * Returns -1 if no stock data (404), 0 if out of stock, >0 if available
 */
export const getAvailableQuantity = async (bookId: string): Promise<number> => {
  try {
    const stocks = await getStockByBookId(bookId);
    
    // null = 404, chưa có stock data
    if (stocks === null) {
      console.log(`ℹ️ No stock data for book ${bookId} - assuming available`);
      return -1; // -1 = chưa có data, UI sẽ không hiển thị stock info
    }
    
    // [] = có data nhưng empty
    if (!stocks || stocks.length === 0) {
      console.log(`⚠️ Empty stock array for book ${bookId}`);
      return 0;
    }
    
    // Sum available quantity from all warehouses (quantityOnHand - reservedQuantity)
    const total = stocks.reduce((total, stock) => {
      const available = stock.quantityOnHand - stock.reservedQuantity;
      return total + (available > 0 ? available : 0);
    }, 0);
    
    console.log(`📦 Total available stock for book ${bookId}:`, total);
    return total;
  } catch (error) {
    console.error(`Error calculating available quantity for book ${bookId}:`, error);
    return -1; // Treat error as "no data available"
  }
};

/**
 * Check stock availability for a specific warehouse and quantity
 */
export const checkStockAvailability = async (
  bookId: string,
  warehouseId: string,
  quantity: number
): Promise<StockAvailability> => {
  try {
    const response = await api.get<any>(API_ENDPOINTS.STOCK.CHECK_AVAILABILITY, {
      params: { bookId, warehouseId, quantity }
    });
    return response;
  } catch (error) {
    console.error(`Error checking stock availability:`, error);
    throw error;
  }
};

const stockService = {
  getStockByBookId,
  getAvailableQuantity,
  checkStockAvailability,
};

export default stockService;
