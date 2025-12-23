// import { OrderDto } from "@/types/dtos";

// export const isPhysicalOrder = (order: OrderDto): boolean => {
//   // Logic: Nếu có tên đường (Street) thì là đơn giao hàng (Sách giấy)
//   // Bạn có thể tùy chỉnh logic này tùy vào dữ liệu thực tế của bạn
//   return !!(order.address && order.address.street && order.address.street.trim() !== "");
// };

// export const isDigitalOrder = (order: OrderDto): boolean => {
//   // Ngược lại là đơn Digital
//   return !isPhysicalOrder(order);
// };

// src/lib/order-helper.ts
import { OrderDto } from "@/types/dtos";

/**
 * Kiểm tra xem đơn hàng có phải là đơn vật lý (Sách giấy) hay không.
 * Logic cải tiến:
 * 1. Nếu có địa chỉ province/district cụ thể (không phải "Digital"/"Online") => Sách giấy
 * 2. Nếu OrderNumber bắt đầu với "RENT-" => E-book (rental)
 * 3. Fallback: có street thực => Sách giấy
 */
export const isPhysicalOrder = (order: OrderDto): boolean => {
  if (!order.address) return false;
  
  // Kiểm tra OrderNumber có phải đơn thuê không
  if (order.orderNumber && order.orderNumber.startsWith('RENT-')) {
    return false; // Đơn thuê = Digital
  }
  
  // Kiểm tra province/district có phải là Digital/Online không
  const province = order.address.province?.toLowerCase() || '';
  const district = order.address.district?.toLowerCase() || '';
  
  if (province.includes('digital') || province.includes('online') || 
      district.includes('digital') || district.includes('online')) {
    return false; // Digital order
  }
  
  // Kiểm tra xem có địa chỉ cụ thể không
  const hasRealAddress = !!(order.address.street && 
                        order.address.street.trim().length > 5 &&
                        !order.address.street.toLowerCase().includes('digital') &&
                        !order.address.street.toLowerCase().includes('online'));
  
  return hasRealAddress;
};

/**
 * Kiểm tra đơn hàng Digital (E-book/Rental)
 * Logic: Là đơn hàng KHÔNG phải vật lý
 */
export const isDigitalOrder = (order: OrderDto): boolean => {
  return !isPhysicalOrder(order);
};