import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

// Shipper Order Interface
export interface ShipperOrder {
  id: string;
  orderNumber: string;
  status: string; // 'Confirmed', 'Shipping', 'Delivered'
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    bookTitle: string;
    quantity: number;
    unitPrice: number;
  }>;
  address: {
    recipientName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    note?: string;
  };
}

export interface UpdateOrderStatusDto {
  orderId: string;
  newStatus: string;
  note?: string;
}

class ShipperOrderService {
  private async getAuthHeader() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Lấy danh sách đơn hàng đã xác nhận (sẵn sàng giao)
  async getConfirmedOrders(): Promise<ShipperOrder[]> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/available-for-shipping`, {
        params: { pageSize: 100 },
        headers: await this.getAuthHeader(),
      });
      
      return response.data.items || response.data || [];
    } catch (error) {
      console.error('Error fetching confirmed orders:', error);
      throw error;
    }
  }

  // Lấy danh sách đơn hàng đang giao của shipper
  async getMyShippingOrders(): Promise<ShipperOrder[]> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/my-shipping-orders`, {
        params: { pageSize: 100 },
        headers: await this.getAuthHeader(),
      });
      
      return response.data.items || response.data || [];
    } catch (error) {
      console.error('Error fetching shipping orders:', error);
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetail(orderId: string): Promise<ShipperOrder> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
        headers: await this.getAuthHeader(),
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  }

  // Xác nhận nhận đơn và bắt đầu giao (Confirmed → Shipping)
  async acceptAndStartDelivery(orderId: string): Promise<void> {
    try {
      const updateData: UpdateOrderStatusDto = {
        orderId,
        newStatus: 'Shipping',
        note: 'Shipper đã nhận đơn và bắt đầu giao hàng',
      };

      await axios.put(`${API_CONFIG.BASE_URL}/orders/status`, updateData, {
        headers: await this.getAuthHeader(),
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  // Xác nhận giao hàng thành công (Shipping → Delivered)
  async markAsDelivered(orderId: string, note?: string): Promise<void> {
    try {
      const updateData: UpdateOrderStatusDto = {
        orderId,
        newStatus: 'Delivered',
        note: note || 'Đơn hàng đã được giao thành công',
      };

      await axios.put(`${API_CONFIG.BASE_URL}/orders/status`, updateData, {
        headers: await this.getAuthHeader(),
      });
    } catch (error) {
      console.error('Error marking as delivered:', error);
      throw error;
    }
  }

  // Báo cáo vấn đề giao hàng
  async reportIssue(orderId: string, issue: string): Promise<void> {
    try {
      const updateData: UpdateOrderStatusDto = {
        orderId,
        newStatus: 'Issue',
        note: `Vấn đề: ${issue}`,
      };

      await axios.put(`${API_CONFIG.BASE_URL}/orders/status`, updateData, {
        headers: await this.getAuthHeader(),
      });
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error;
    }
  }
}

export default new ShipperOrderService();
