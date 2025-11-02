using System;

namespace BookStore.Domain.Events
{
    /// <summary>
    /// Phát khi đơn hàng được tạo thành công từ CartCheckedOut hoặc từ API.
    /// </summary>
    public sealed class OrderPlaced
    {
        public Guid OrderId { get; }
        public Guid UserId { get; }
        public decimal TotalAmount { get; }
        public DateTime OccurredAt { get; } = DateTime.UtcNow;

        public OrderPlaced(Guid orderId, Guid userId, decimal totalAmount)
        {
            OrderId = orderId;
            UserId = userId;
            TotalAmount = totalAmount;
        }
    }
}
