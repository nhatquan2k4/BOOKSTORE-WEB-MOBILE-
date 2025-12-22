using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Ordering;
using BookStore.Application.Mappers.Ordering;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Cart;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Shared.Utilities;
using BookStore.Shared.Exceptions;
using Microsoft.Extensions.Logging;
using BookStore.Application.IService.System;
using BookStore.Application.Dtos.System.Notification;
using IdentityEmailService = BookStore.Application.IService.Identity.Email.IEmailService;
using BookStore.Domain.IRepository.Identity.User;

namespace BookStore.Application.Services.Ordering
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IOrderStatusLogRepository _statusLogRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<OrderService> _logger;
        private readonly INotificationService _notificationService;
        private readonly IdentityEmailService _emailService;
        private readonly IUserRepository _userRepository;
        private readonly ISignalRService _signalRService;

        public OrderService(
            IOrderRepository orderRepository,
            IOrderItemRepository orderItemRepository,
            IOrderStatusLogRepository statusLogRepository,
            ICartRepository cartRepository,
            IBookRepository bookRepository,
            ILogger<OrderService> logger,
            INotificationService notificationService,
            IdentityEmailService emailService,
            IUserRepository userRepository,
            ISignalRService signalRService)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _statusLogRepository = statusLogRepository;
            _cartRepository = cartRepository;
            _bookRepository = bookRepository;
            _logger = logger;
            _notificationService = notificationService;
            _emailService = emailService;
            _userRepository = userRepository;
            _signalRService = signalRService;
        }

        #region Get Orders

        public async Task<(List<OrderDto> Items, int TotalCount)> GetAllOrdersAsync(int pageNumber = 1, int pageSize = 10, string? status = null)
        {
            var skip = (pageNumber - 1) * pageSize;
            IEnumerable<Order> orders;
            int totalCount;

            if (!string.IsNullOrEmpty(status))
            {
                orders = await _orderRepository.GetOrdersByStatusAsync(status, skip, pageSize);
                totalCount = orders.Count();
            }
            else
            {
                var allOrders = await _orderRepository.GetAllAsync();
                totalCount = allOrders.Count();
                orders = allOrders.Skip(skip).Take(pageSize);
            }

            var orderDtos = orders.Select(o => o.ToDto()).ToList();
            return (orderDtos, totalCount);
        }

        public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return order?.ToDto();
        }

        public async Task<OrderDto?> GetOrderByOrderNumberAsync(string orderNumber)
        {
            var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
            return order?.ToDto();
        }

        public async Task<(List<OrderDto> Items, int TotalCount)> GetOrdersByUserIdAsync(Guid userId, string? status = null, int pageNumber = 1, int pageSize = 10)
        {
            var skip = (pageNumber - 1) * pageSize;
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId, status, skip, pageSize);
            var totalCount = await _orderRepository.CountOrdersByUserIdAsync(userId, status);

            var orderDtos = orders.Select(o => o.ToDto()).ToList();
            return (orderDtos, totalCount);
        }

        #endregion

        #region Create Order

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
        {
            Guard.Against(dto.Items == null || !dto.Items.Any(), "Đơn hàng phải có ít nhất 1 sản phẩm");

            var orderAddress = new OrderAddress
            {
                Id = Guid.NewGuid(),
                RecipientName = dto.Address.RecipientName,
                PhoneNumber = dto.Address.PhoneNumber,
                Province = dto.Address.Province,
                District = dto.Address.District,
                Ward = dto.Address.Ward,
                Street = dto.Address.Street,
                Note = dto.Address.Note
            };

            decimal totalAmount = dto.Items!.Sum(item => item.UnitPrice * item.Quantity);
            decimal discountAmount = 0;

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                OrderNumber = GenerateOrderNumber(),
                Status = "Pending",
                TotalAmount = totalAmount,
                DiscountAmount = discountAmount,
                CreatedAt = DateTime.UtcNow,
                AddressId = orderAddress.Id,
                Address = orderAddress,
                CouponId = dto.CouponId
            };

            foreach (var itemDto in dto.Items!)
            {
                var book = await _bookRepository.GetByIdAsync(itemDto.BookId);
                Guard.Against(book == null, $"Sách với ID {itemDto.BookId} không tồn tại");

                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    BookId = itemDto.BookId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice
                });
            }

            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            _logger.LogInformation($"Order created: {order.OrderNumber} for user {dto.UserId}");

            // ✅ Tạo notification khi đặt hàng thành công
            try
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = dto.UserId,
                    Title = "Đơn hàng đã được tạo",
                    Message = $"Đơn hàng #{order.OrderNumber} của bạn đã được tạo thành công với tổng giá trị {totalAmount:N0}₫",
                    Type = "order",
                    Link = $"/account/orders/{order.Id}"
                });

                _logger.LogInformation("Created order notification for user {UserId}", dto.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create notification for order {OrderNumber}", order.OrderNumber);
            }

            // ✅ Gửi email xác nhận đơn hàng
            try
            {
                var user = await _userRepository.GetByIdAsync(dto.UserId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    var itemsHtml = string.Join("", order.Items.Select(item => 
                        $"<tr><td>{item.Book?.Title ?? "Sản phẩm"}</td><td style='text-align: center;'>{item.Quantity}</td><td style='text-align: right;'>{item.UnitPrice:N0}₫</td><td style='text-align: right;'>{(item.Quantity * item.UnitPrice):N0}₫</td></tr>"
                    ));

                    var subject = $"Xác nhận đơn hàng #{order.OrderNumber} - BookStore";
                    var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .order-info {{ background-color: #fff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fff; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #2196F3; color: white; }}
        .total {{ font-size: 18px; font-weight: bold; color: #2196F3; text-align: right; padding: 15px; background-color: #fff; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📦 Đơn hàng của bạn đã được tạo</h1>
        </div>
        <div class='content'>
            <h2>Xin chào {user.Profiles?.FullName ?? user.Email}!</h2>
            <p>Cảm ơn bạn đã đặt hàng tại BookStore. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.</p>
            
            <div class='order-info'>
                <p><strong>Mã đơn hàng:</strong> {order.OrderNumber}</p>
                <p><strong>Ngày đặt:</strong> {order.CreatedAt:dd/MM/yyyy HH:mm}</p>
                <p><strong>Trạng thái:</strong> Chờ thanh toán</p>
            </div>

            <h3>Chi tiết đơn hàng:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style='text-align: center;'>Số lượng</th>
                        <th style='text-align: right;'>Đơn giá</th>
                        <th style='text-align: right;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
            </table>

            <div class='total'>
                Tổng cộng: {totalAmount:N0}₫
            </div>

            <div class='order-info'>
                <h4>Địa chỉ giao hàng:</h4>
                <p><strong>Người nhận:</strong> {orderAddress.RecipientName}</p>
                <p><strong>Số điện thoại:</strong> {orderAddress.PhoneNumber}</p>
                <p><strong>Địa chỉ:</strong> {orderAddress.Street}, {orderAddress.Ward}, {orderAddress.District}, {orderAddress.Province}</p>
                {(!string.IsNullOrEmpty(orderAddress.Note) ? $"<p><strong>Ghi chú:</strong> {orderAddress.Note}</p>" : "")}
            </div>

            <p>Vui lòng thanh toán để chúng tôi bắt đầu xử lý đơn hàng của bạn.</p>
            <p>Bạn có thể theo dõi trạng thái đơn hàng tại <a href='https://bookstore.com/account/orders/{order.Id}'>Đơn hàng của tôi</a>.</p>
        </div>
        <div class='footer'>
            <p>© 2024 BookStore. All rights reserved.</p>
            <p>Nếu có bất kỳ thắc mắc, vui lòng liên hệ: support@bookstore.com</p>
        </div>
    </div>
</body>
</html>";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                    _logger.LogInformation("Sent order confirmation email to {Email}", user.Email);
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send order confirmation email");
            }

            return order.ToDto();
        }

        public async Task<OrderDto> CreateOrderFromCartAsync(Guid userId, CreateOrderAddressDto address, Guid? couponId = null)
        {
            var cart = await _cartRepository.GetActiveCartByUserIdAsync(userId);
            Guard.Against(cart == null || !cart.Items.Any(), "Giỏ hàng trống");

            var orderItems = cart!.Items.Select(cartItem => new CreateOrderItemDto
            {
                BookId = cartItem.BookId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice
            }).ToList();

            var createOrderDto = new CreateOrderDto
            {
                UserId = userId,
                Items = orderItems,
                Address = address,
                CouponId = couponId
            };

            var order = await CreateOrderAsync(createOrderDto);

            await _cartRepository.DeactivateCartAsync(cart.Id);
            await _cartRepository.SaveChangesAsync();

            return order;
        }

        public async Task<OrderDto> CreateRentalOrderAsync(Guid userId, Guid bookId, int days)
        {
            var book = await _bookRepository.GetDetailByIdAsync(bookId);
            Guard.Against(book == null, "Sách không tồn tại");

            var bookPrice = book!.Prices?.Where(p => p.IsCurrent && p.EffectiveFrom <= DateTime.UtcNow)
                                        .OrderByDescending(p => p.EffectiveFrom)
                                        .FirstOrDefault()?.Amount ?? 0;
            Guard.Against(bookPrice <= 0, "Sách chưa có giá bán, không thể thuê");

            decimal rentalPrice = 0;
            if (days == 3) rentalPrice = 10000;
            else
            {
                decimal percent = days switch
                {
                    7 => 0.05m,
                    15 => 0.08m,
                    30 => 0.12m,
                    60 => 0.20m,
                    90 => 0.25m,
                    180 => 0.35m,
                    365 => 0.50m,
                    _ => 0
                };
                if (percent == 0) throw new UserFriendlyException("Gói thuê không hợp lệ");

                rentalPrice = Math.Round((bookPrice * percent) / 1000) * 1000;
            }

            var dummyAddress = new OrderAddress
            {
                Id = Guid.NewGuid(),
                RecipientName = "Digital Rental",
                PhoneNumber = "N/A",
                Province = "Online",
                District = "Online",
                Ward = "Online",
                Street = "Digital Delivery",
                Note = $"Rental: {days} days"
            };

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OrderNumber = "RENT-" + GenerateOrderNumber().Substring(4),
                Status = "Pending",
                TotalAmount = rentalPrice,
                DiscountAmount = 0,
                CreatedAt = DateTime.UtcNow,
                AddressId = dummyAddress.Id,
                Address = dummyAddress
            };

            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                BookId = bookId,
                Quantity = 1,
                UnitPrice = rentalPrice
            });

            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            return order.ToDto();
        }

        #endregion

        #region Update Order

        public async Task<OrderDto> UpdateOrderStatusAsync(UpdateOrderStatusDto dto)
        {
            await _orderRepository.UpdateOrderStatusAsync(dto.OrderId, dto.NewStatus, dto.Note);
            await _orderRepository.SaveChangesAsync();

            var order = await _orderRepository.GetOrderWithDetailsAsync(dto.OrderId);
            return order!.ToDto();
        }

        public async Task<OrderDto> CancelOrderAsync(CancelOrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Pending",
                "Chỉ có thể hủy đơn hàng đang ở trạng thái Pending");

            await _orderRepository.UpdateOrderStatusAsync(dto.OrderId, "Cancelled", dto.Reason);
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(dto.OrderId);
            return updatedOrder!.ToDto();
        }

        public async Task<OrderDto> ConfirmOrderPaymentAsync(Guid orderId)
        {
            await ConfirmPaymentAsync(orderId.ToString(), 0);
            var order = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return order!.ToDto();
        }

        // --- CẬP NHẬT: XỬ LÝ THANH TOÁN SEPAY & BẮN SIGNALR ---
        public async Task ConfirmPaymentAsync(string orderId, decimal amountPaid)
        {
            _logger.LogInformation($"[SePay] Received payment confirm for {orderId}, amount: {amountPaid}");

            Order? order = null;

            if (Guid.TryParse(orderId, out var orderGuid))
            {
                order = await _orderRepository.GetByIdAsync(orderGuid);
            }

            if (order == null)
            {
                order = await _orderRepository.GetByOrderNumberAsync(orderId);
            }

            if (order == null)
            {
                _logger.LogWarning($"[SePay] Order not found: {orderId}");
                return;
            }

            if (order.Status == "Paid" || order.Status == "Completed" || order.Status == "Cancelled")
            {
                _logger.LogInformation($"[SePay] Order {order.OrderNumber} is already {order.Status}. Skipping.");
                // Vẫn bắn SignalR để Frontend chuyển trang nếu lỡ chưa chuyển
                await _signalRService.SendPaymentStatusAsync(order.Id.ToString(), "Paid");
                return;
            }

            if (amountPaid == 0 || amountPaid >= order.TotalAmount - 1000)
            {
                // 1. Cập nhật trạng thái
                order.Status = "Paid";
                order.PaidAt = DateTime.UtcNow;

                // 2. Lưu lại
                await _orderRepository.SaveChangesAsync();

                // 3. Ghi log lịch sử
                await _orderRepository.UpdateOrderStatusAsync(order.Id, "Paid", $"SePay confirmed payment: {amountPaid:N0}");
                await _orderRepository.SaveChangesAsync();

                _logger.LogInformation($"[SePay] Order {order.OrderNumber} updated to Paid.");

                // 4. BẮN TÍN HIỆU REAL-TIME CHO FRONTEND QUA INTERFACE
                try
                {
                    // SỬA LẠI: Dùng order.Id.ToString() để khớp với GUID trên URL của bạn
                    await _signalRService.SendPaymentStatusAsync(order.Id.ToString(), "Paid");

                    _logger.LogInformation($"[SignalR] Sent ReceivePaymentStatus for ID: {order.Id}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"[SignalR] Error sending notification: {ex.Message}");
                }
            }
            else
            {
                _logger.LogWarning($"[SePay] Payment amount mismatch for {order.OrderNumber}. Expected: {order.TotalAmount}, Paid: {amountPaid}");
            }
        }

        public async Task<OrderDto> ShipOrderAsync(Guid orderId, string? note = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Paid",
                "Chỉ có thể ship đơn hàng đã thanh toán");

            await _orderRepository.UpdateOrderStatusAsync(orderId, "Shipped", note ?? "Order shipped");
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return updatedOrder!.ToDto();
        }

        public async Task<OrderDto> CompleteOrderAsync(Guid orderId, string? note = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Shipped",
                "Chỉ có thể hoàn thành đơn hàng đã được ship");

            order.Status = "Completed";
            order.CompletedAt = DateTime.UtcNow;
            await _orderRepository.SaveChangesAsync();

            await _orderRepository.UpdateOrderStatusAsync(orderId, "Completed", note ?? "Order completed");
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return updatedOrder!.ToDto();
        }

        #endregion

        #region Statistics & Validation & Helpers

        public async Task<decimal> GetTotalRevenueAsync(DateTime fromDate, DateTime toDate)
        {
            return await _orderRepository.GetTotalRevenueAsync(fromDate, toDate);
        }

        public async Task<int> GetTotalOrdersCountAsync(string? status = null)
        {
            if (string.IsNullOrEmpty(status))
            {
                var allOrders = await _orderRepository.GetAllAsync();
                return allOrders.Count();
            }
            var orders = await _orderRepository.GetOrdersByStatusAsync(status, 0, int.MaxValue);
            return orders.Count();
        }

        public async Task<Dictionary<string, int>> GetOrdersCountByStatusAsync()
        {
            var allOrders = await _orderRepository.GetAllAsync();
            return allOrders.GroupBy(o => o.Status)
                            .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<bool> IsOrderOwnedByUserAsync(Guid orderId, Guid userId)
        {
            return await _orderRepository.IsOrderOwnedByUserAsync(orderId, userId);
        }

        public async Task<bool> CanCancelOrderAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            return order != null && order.Status == "Pending";
        }

        private string GenerateOrderNumber()
        {
            var date = DateTime.UtcNow.ToString("yyyyMMdd");
            var random = new Random().Next(100000, 999999);
            return $"ORD-{date}-{random}";
        }

        public async Task<IEnumerable<OrderStatusLogDto>> GetOrderStatusHistoryAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Order not found");
            var logs = await _statusLogRepository.GetByOrderIdAsync(orderId);
            return logs.ToDtoList();
        }

        #endregion
    }
}