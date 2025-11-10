using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Ordering;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Cart;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Ordering
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            IOrderRepository orderRepository,
            IOrderItemRepository orderItemRepository,
            ICartRepository cartRepository,
            IBookRepository bookRepository,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _cartRepository = cartRepository;
            _bookRepository = bookRepository;
            _logger = logger;
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
                totalCount = orders.Count(); // Approximate - should add CountByStatus method
            }
            else
            {
                var allOrders = await _orderRepository.GetAllAsync();
                totalCount = allOrders.Count();
                orders = allOrders.Skip(skip).Take(pageSize);
            }

            var orderDtos = orders.Select(MapToOrderDto).ToList();
            return (orderDtos, totalCount);
        }

        public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return order == null ? null : MapToOrderDto(order);
        }

        public async Task<OrderDto?> GetOrderByOrderNumberAsync(string orderNumber)
        {
            var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
            return order == null ? null : MapToOrderDto(order);
        }

        public async Task<(List<OrderDto> Items, int TotalCount)> GetOrdersByUserIdAsync(Guid userId, string? status = null, int pageNumber = 1, int pageSize = 10)
        {
            var skip = (pageNumber - 1) * pageSize;
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId, status, skip, pageSize);
            var totalCount = await _orderRepository.CountOrdersByUserIdAsync(userId, status);

            var orderDtos = orders.Select(MapToOrderDto).ToList();
            return (orderDtos, totalCount);
        }

        #endregion

        #region Create Order

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
        {
            // Validate items
            Guard.Against(dto.Items == null || !dto.Items.Any(),
                "Đơn hàng phải có ít nhất 1 sản phẩm");

            // Create OrderAddress
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

            // Calculate total
            decimal totalAmount = dto.Items!.Sum(item => item.UnitPrice * item.Quantity);
            decimal discountAmount = 0; // TODO: Apply coupon logic

            // Create Order
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

            // Add OrderItems
            foreach (var itemDto in dto.Items!)
            {
                var book = await _bookRepository.GetByIdAsync(itemDto.BookId);
                Guard.Against(book == null,
                    $"Sách với ID {itemDto.BookId} không tồn tại");

                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    BookId = itemDto.BookId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice
                });
            }

            // Save to database
            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            _logger.LogInformation($"Order created: {order.OrderNumber} for user {dto.UserId}");

            return MapToOrderDto(order);
        }

        public async Task<OrderDto> CreateOrderFromCartAsync(Guid userId, CreateOrderAddressDto address, Guid? couponId = null)
        {
            // Get active cart
            var cart = await _cartRepository.GetActiveCartByUserIdAsync(userId);
            Guard.Against(cart == null || !cart.Items.Any(), "Giỏ hàng trống");

            // Convert CartItems to OrderItems
            var orderItems = cart!.Items.Select(cartItem => new CreateOrderItemDto
            {
                BookId = cartItem.BookId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.UnitPrice // Use UnitPrice from CartItem (already stored when added to cart)
            }).ToList();

            // Create order
            var createOrderDto = new CreateOrderDto
            {
                UserId = userId,
                Items = orderItems,
                Address = address,
                CouponId = couponId
            };

            var order = await CreateOrderAsync(createOrderDto);

            // Deactivate cart after successful order
            await _cartRepository.DeactivateCartAsync(cart.Id);
            await _cartRepository.SaveChangesAsync();

            return order;
        }

        #endregion

        #region Update Order

        public async Task<OrderDto> UpdateOrderStatusAsync(UpdateOrderStatusDto dto)
        {
            await _orderRepository.UpdateOrderStatusAsync(dto.OrderId, dto.NewStatus, dto.Note);
            await _orderRepository.SaveChangesAsync();

            var order = await _orderRepository.GetOrderWithDetailsAsync(dto.OrderId);
            return MapToOrderDto(order!);
        }

        public async Task<OrderDto> CancelOrderAsync(CancelOrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Pending",
                "Chỉ có thể hủy đơn hàng đang ở trạng thái Pending"); await _orderRepository.UpdateOrderStatusAsync(dto.OrderId, "Cancelled", dto.Reason);
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(dto.OrderId);
            return MapToOrderDto(updatedOrder!);
        }

        public async Task<OrderDto> ConfirmOrderPaymentAsync(Guid orderId)
        {
            await _orderRepository.UpdateOrderStatusAsync(orderId, "Paid", "Payment confirmed");
            await _orderRepository.SaveChangesAsync();

            var order = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return MapToOrderDto(order!);
        }

        public async Task<OrderDto> ShipOrderAsync(Guid orderId, string? note = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Paid",
                "Chỉ có thể ship đơn hàng đã thanh toán"); await _orderRepository.UpdateOrderStatusAsync(orderId, "Shipped", note ?? "Order shipped");
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return MapToOrderDto(updatedOrder!);
        }

        public async Task<OrderDto> CompleteOrderAsync(Guid orderId, string? note = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            Guard.Against(order!.Status != "Shipped",
                "Chỉ có thể hoàn thành đơn hàng đã được ship"); await _orderRepository.UpdateOrderStatusAsync(orderId, "Completed", note ?? "Order completed");
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository.GetOrderWithDetailsAsync(orderId);
            return MapToOrderDto(updatedOrder!);
        }

        #endregion

        #region Statistics

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

        #endregion

        #region Validation

        public async Task<bool> IsOrderOwnedByUserAsync(Guid orderId, Guid userId)
        {
            return await _orderRepository.IsOrderOwnedByUserAsync(orderId, userId);
        }

        public async Task<bool> CanCancelOrderAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            return order != null && order.Status == "Pending";
        }

        #endregion

        #region Mappers

        private OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User?.Profiles?.FullName ?? string.Empty,
                UserEmail = order.User?.Email ?? string.Empty,
                Status = order.Status,
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.FinalAmount,
                CreatedAt = order.CreatedAt,
                PaidAt = order.PaidAt,
                CompletedAt = order.CompletedAt,
                CancelledAt = order.CancelledAt,
                Items = order.Items.Select(MapToOrderItemDto).ToList(),
                Address = MapToOrderAddressDto(order.Address),
                PaymentTransaction = order.PaymentTransaction != null ? MapToPaymentTransactionDto(order.PaymentTransaction) : null,
                CouponCode = order.Coupon?.Code
            };
        }

        private OrderItemDto MapToOrderItemDto(OrderItem item)
        {
            return new OrderItemDto
            {
                Id = item.Id,
                OrderId = item.OrderId,
                BookId = item.BookId,
                BookTitle = item.Book?.Title ?? string.Empty,
                BookISBN = item.Book?.ISBN?.Value ?? string.Empty,
                BookImageUrl = item.Book?.Images?.FirstOrDefault()?.ImageUrl,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Subtotal = item.Subtotal
            };
        }

        private OrderAddressDto MapToOrderAddressDto(OrderAddress address)
        {
            return new OrderAddressDto
            {
                Id = address.Id,
                RecipientName = address.RecipientName,
                PhoneNumber = address.PhoneNumber,
                Province = address.Province,
                District = address.District,
                Ward = address.Ward,
                Street = address.Street,
                Note = address.Note
            };
        }

        private PaymentTransactionDto MapToPaymentTransactionDto(PaymentTransaction payment)
        {
            return new PaymentTransactionDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                Provider = payment.Provider,
                TransactionCode = payment.TransactionCode,
                PaymentMethod = payment.PaymentMethod,
                Amount = payment.Amount,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt
            };
        }

        private string GenerateOrderNumber()
        {
            // Format: ORD-YYYYMMDD-XXXXXX
            var date = DateTime.UtcNow.ToString("yyyyMMdd");
            var random = new Random().Next(100000, 999999);
            return $"ORD-{date}-{random}";
        }

        #endregion
    }
}
