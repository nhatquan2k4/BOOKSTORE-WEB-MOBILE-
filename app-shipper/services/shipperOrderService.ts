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
    bookId: string;
    bookISBN: string;
    bookTitle: string;
    bookImageUrl?: string; // Path to book cover image (e.g. /book-images/book_xxx.jpg)
    quantity: number;
    unitPrice: number;
    subtotal: number;
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
  // Debug: log token presence (do not log in production)
  console.debug('[ShipperOrderService] getAuthHeader token:', token ? '<<present>>' : '<<missing>>');
    if (!token) {
      // Throw a specific error so callers can catch and redirect to login
      const err: any = new Error('No access token in storage');
      err.code = 'NO_TOKEN';
      throw err;
    }

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
      // Improve logging to include HTTP status / response body for diagnosis
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error fetching confirmed orders: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error fetching confirmed orders:', error);
      }
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
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error fetching shipping orders: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error fetching shipping orders:', error);
      }
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
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error fetching order detail: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error fetching order detail:', error);
      }
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng theo orderNumber (fallback khi không có quyền truy cập theo ID)
  async getOrderByNumber(orderNumber: string): Promise<ShipperOrder> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/Orders/order-number/${encodeURIComponent(orderNumber)}`, {
        headers: await this.getAuthHeader(),
      });
      
      return response.data;
    } catch (error) {
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error fetching order by number: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error fetching order by number:', error);
      }
      throw error;
    }
  }

  // Lấy order thông qua shipment (fallback cuối cùng khi các endpoint khác bị 403)
  async getOrderViaShipment(orderId: string): Promise<ShipperOrder> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/shipments/order/${orderId}`, {
        headers: await this.getAuthHeader(),
      });
      
      // Shipment response contains embedded order object
      const shipment = response.data;
      if (shipment && shipment.order) {
        return shipment.order;
      }
      
      throw new Error('Shipment does not contain order data');
    } catch (error) {
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error fetching order via shipment: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error fetching order via shipment:', error);
      }
      throw error;
    }
  }

  // Xác nhận nhận đơn và bắt đầu giao (Confirmed → Shipping)
  async acceptAndStartDelivery(orderId: string): Promise<void> {
    try {
      // Step 1: get current user from storage
      const userStr = await AsyncStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (!currentUser) {
        const err: any = new Error('No current user');
        err.code = 'NO_TOKEN';
        throw err;
      }

      // Step 2: fetch shipper record for current user
      // Backend should expose GET /shippers/me which returns the shipper DTO for the logged-in user
      const shipperResp = await axios.get(`${API_CONFIG.BASE_URL}/shippers/me`, {
        headers: await this.getAuthHeader(),
      });

      const shipper = shipperResp.data;
      if (!shipper || !shipper.id) {
        const err: any = new Error('Không tìm thấy thông tin shipper');
        err.code = 'NO_SHIPPER';
        throw err;
      }

      // Step 3: create shipment record linking this shipper and the order
      // Backend expects CreateShipmentDto: { OrderId, ShipperId, ShipperName? }
      try {
        await axios.post(`${API_CONFIG.BASE_URL}/shipments`, {
          orderId,
          shipperId: shipper.id,
          shipperName: shipper.name ?? shipper.fullName ?? currentUser.userName ?? currentUser.email,
        }, {
          headers: await this.getAuthHeader(),
        });
      } catch (createErr) {
        // If backend responds 400, treat as 'order already has shipment'
        if ((createErr as any).isAxiosError && (createErr as any).response?.status === 400) {
          // Try to fetch existing shipment; if that also fails, still throw a controlled error
          try {
            const existingResp = await axios.get(`${API_CONFIG.BASE_URL}/shipments/order/${orderId}`, {
              headers: await this.getAuthHeader(),
            });
            const existingShipment = existingResp.data;

            // If the existing shipment belongs to the same shipper (current user), consider accept successful
            if (existingShipment && existingShipment.shipperId === shipper.id) {
              // Attempt to update order status to Shipping (best-effort)
              const updateData: UpdateOrderStatusDto = {
                orderId,
                newStatus: 'Shipping',
                note: 'Shipper đã nhận đơn và bắt đầu giao hàng',
              };

              try {
                await axios.put(`${API_CONFIG.BASE_URL}/orders/status`, updateData, {
                  headers: await this.getAuthHeader(),
                });
              } catch (statusErr) {
                if ((statusErr as any).isAxiosError) {
                  const axiosErr = statusErr as any;
                  console.error('[ShipperOrderService] Failed to update order status after finding existing same-shipper shipment: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
                } else {
                  console.error('[ShipperOrderService] Failed to update order status after finding existing same-shipper shipment:', statusErr);
                }
              }

              // Return successfully — shipment exists and belongs to current shipper
              return;
            }

            const err: any = new Error('ORDER_ALREADY_HAS_SHIPMENT');
            err.code = 'ORDER_ALREADY_HAS_SHIPMENT';
            err.existingShipment = existingShipment;
            // Do not log as an Axios error here — let caller decide how to present it
            throw err;
          } catch (fetchErr) {
            const err: any = new Error('ORDER_ALREADY_HAS_SHIPMENT');
            err.code = 'ORDER_ALREADY_HAS_SHIPMENT';
            // no existingShipment available
            throw err;
          }
        }

        // rethrow other errors unchanged
        throw createErr;
      }

      // Step 4: update order status to Shipping
      const updateData: UpdateOrderStatusDto = {
        orderId,
        newStatus: 'Shipping',
        note: 'Shipper đã nhận đơn và bắt đầu giao hàng',
      };

      try {
        await axios.put(`${API_CONFIG.BASE_URL}/orders/status`, updateData, {
          headers: await this.getAuthHeader(),
        });
      } catch (statusErr) {
        // Order status update failed, but shipment was created. Log and allow caller to proceed.
        if ((statusErr as any).isAxiosError) {
          const axiosErr = statusErr as any;
          console.error('[ShipperOrderService] Failed to update order status after creating shipment: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
        } else {
          console.error('[ShipperOrderService] Failed to update order status after creating shipment:', statusErr);
        }
        // Do not throw — the shipment exists and the UI can refresh to see the current state.
      }
    } catch (error) {
      // If this is a controlled client error (e.g. ORDER_ALREADY_HAS_SHIPMENT), don't log it as an unexpected error
      if ((error as any)?.code === 'ORDER_ALREADY_HAS_SHIPMENT') {
        throw error; // let caller/UI handle this gracefully
      }

      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error accepting order: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error accepting order:', error);
      }
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
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error marking as delivered: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error marking as delivered:', error);
      }
      throw error;
    }
  }

  // Shipper confirms COD payment collected and marks payment as paid
  async confirmCodPayment(orderId: string): Promise<void> {
    try {
      // Backend exposes PUT /api/orders/{id}/confirm-payment and now allows Shipper role
      await axios.put(`${API_CONFIG.BASE_URL}/orders/${orderId}/confirm-payment`, null, {
        headers: await this.getAuthHeader(),
      });
    } catch (error) {
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error confirming COD payment: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error confirming COD payment:', error);
      }
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
      if ((error as any).isAxiosError) {
        const axiosErr = error as any;
        console.error('[ShipperOrderService] Error reporting issue: status=', axiosErr.response?.status, 'data=', axiosErr.response?.data);
      } else {
        console.error('[ShipperOrderService] Error reporting issue:', error);
      }
      throw error;
    }
  }
}

export default new ShipperOrderService();
