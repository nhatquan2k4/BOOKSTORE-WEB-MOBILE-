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
 * Logic: Đơn sách giấy bắt buộc phải có địa chỉ đường (Street).
 */
export const isPhysicalOrder = (order: OrderDto): boolean => {
  if (!order.address) return false;
  
  // Kiểm tra xem có trường Street và không phải là chuỗi rỗng
  const hasStreet = order.address.street && order.address.street.trim().length > 0;
  
  // Bạn có thể bổ sung logic: Ví dụ đơn Digital thì Province là "Online"
  // const isOnline = order.address.province === 'Online';
  
  return hasStreet;
};

/**
 * Kiểm tra đơn hàng Digital (E-book)
 * Logic: Là đơn hàng KHÔNG phải vật lý
 */
export const isDigitalOrder = (order: OrderDto): boolean => {
  return !isPhysicalOrder(order);
};