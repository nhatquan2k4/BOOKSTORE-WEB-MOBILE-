using BookStore.Application.Dtos.Ordering;
using BookStore.Application.Mappers.Payment;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Application.Mappers.Ordering
{
    public static class OrderMapper
    {
        // Order Entity -> OrderDto
        public static OrderDto ToDto(this Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User?.Profiles?.FullName ?? order.User?.Email ?? string.Empty,
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
                Items = order.Items?.Select(i => i.ToDto()).ToList() ?? new List<OrderItemDto>(),
                Address = order.Address?.ToDto() ?? new OrderAddressDto(),
                PaymentTransaction = order.PaymentTransaction?.ToPaymentDto(),
                CouponCode = order.Coupon?.Code
            };
        }

        // OrderItem Entity -> OrderItemDto
        public static OrderItemDto ToDto(this OrderItem item)
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

        // OrderAddress Entity -> OrderAddressDto
        public static OrderAddressDto ToDto(this OrderAddress address)
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

        // PaymentTransaction Entity -> PaymentTransactionDto (for OrderDto)
        public static PaymentTransactionDto ToPaymentDto(this Domain.Entities.Ordering___Payment.PaymentTransaction payment)
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

        // CreateOrderDto -> Order Entity (partial - needs additional setup)
        public static Order ToEntity(this CreateOrderDto dto, Guid userId)
        {
            return new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Status = "Pending",
                OrderNumber = GenerateOrderNumber(),
                TotalAmount = 0, // Will be calculated from items
                DiscountAmount = 0,
                CreatedAt = DateTime.UtcNow
            };
        }

        // OrderAddressDto -> OrderAddress Entity
        public static OrderAddress ToEntity(this OrderAddressDto dto)
        {
            return new OrderAddress
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                RecipientName = dto.RecipientName,
                PhoneNumber = dto.PhoneNumber,
                Province = dto.Province,
                District = dto.District,
                Ward = dto.Ward,
                Street = dto.Street,
                Note = dto.Note
            };
        }

        // CreateOrderAddressDto -> OrderAddress Entity
        public static OrderAddress ToEntity(this CreateOrderAddressDto dto)
        {
            return new OrderAddress
            {
                Id = Guid.NewGuid(),
                RecipientName = dto.RecipientName,
                PhoneNumber = dto.PhoneNumber,
                Province = dto.Province,
                District = dto.District,
                Ward = dto.Ward,
                Street = dto.Street,
                Note = dto.Note
            };
        }

        // CreateOrderItemDto -> OrderItem Entity
        public static OrderItem ToEntity(this CreateOrderItemDto dto, Guid orderId)
        {
            return new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                BookId = dto.BookId,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice
            };
        }

        // UpdateOrderDto -> Update Order Entity
        public static void UpdateFromDto(this Order order, UpdateOrderDto dto)
        {
            if (!string.IsNullOrEmpty(dto.Status))
            {
                order.Status = dto.Status;

                // Update timestamps based on status
                if (dto.Status == "Paid" && !order.PaidAt.HasValue)
                    order.PaidAt = DateTime.UtcNow;
                else if (dto.Status == "Completed" && !order.CompletedAt.HasValue)
                    order.CompletedAt = DateTime.UtcNow;
                else if (dto.Status == "Cancelled" && !order.CancelledAt.HasValue)
                    order.CancelledAt = DateTime.UtcNow;
            }
        }

        // UpdateOrderStatusDto -> Update Order Status
        public static void UpdateStatus(this Order order, UpdateOrderStatusDto dto)
        {
            order.Status = dto.NewStatus;

            // Update timestamps based on status
            if (dto.NewStatus == "Paid" && !order.PaidAt.HasValue)
                order.PaidAt = DateTime.UtcNow;
            else if (dto.NewStatus == "Completed" && !order.CompletedAt.HasValue)
                order.CompletedAt = DateTime.UtcNow;
            else if (dto.NewStatus == "Cancelled" && !order.CancelledAt.HasValue)
                order.CancelledAt = DateTime.UtcNow;
        }

        // Helper method to generate order number
        private static string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"BK-{timestamp}-{random}";
        }
    }
}
