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
using BookStore.Application.IService.System; // ✅ Sử dụng Interface thay vì Hub trực tiếp

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
        
        // ✅ Thay IHubContext bằng Interface để tránh lỗi Circular Dependency
        private readonly ISignalRService _signalRService;

        public OrderService(
            IOrderRepository orderRepository,
            IOrderItemRepository orderItemRepository,
            IOrderStatusLogRepository statusLogRepository,
            ICartRepository cartRepository,
            IBookRepository bookRepository,
            ILogger<OrderService> logger,
            ISignalRService signalRService) // ✅ Inject Interface
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _statusLogRepository = statusLogRepository;
            _cartRepository = cartRepository;
            _bookRepository = bookRepository;
            _logger = logger;
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
                decimal percent = days switch { 
                    7 => 0.05m, 15 => 0.08m, 30 => 0.12m, 60 => 0.20m, 
                    90 => 0.25m, 180 => 0.35m, 365 => 0.50m, _ => 0 
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
                    await _signalRService.SendPaymentStatusAsync(order.Id.ToString(), "Paid");
                    _logger.LogInformation($"[SignalR] Sent ReceivePaymentStatus for {order.OrderNumber}");
                }
                catch(Exception ex)
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