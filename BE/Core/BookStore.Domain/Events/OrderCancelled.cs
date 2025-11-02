using System;

namespace BookStore.Domain.Events
{
    public sealed class OrderCancelled
    {
        public Guid OrderId { get; }
        public string? Reason { get; }
        public DateTime OccurredAt { get; } = DateTime.UtcNow;

        public OrderCancelled(Guid orderId, string? reason = null)
        {
            OrderId = orderId;
            Reason = reason;
        }
    }
}
