using System;

namespace BookStore.Domain.Events
{
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
