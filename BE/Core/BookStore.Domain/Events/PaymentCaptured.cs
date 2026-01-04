using System;

namespace BookStore.Domain.Events
{

    public sealed class PaymentCaptured
    {
        public Guid OrderId { get; }
        public Guid PaymentTransactionId { get; }
        public decimal Amount { get; }
        public DateTime OccurredAt { get; } = DateTime.UtcNow;

        public PaymentCaptured(Guid orderId, Guid paymentTransactionId, decimal amount)
        {
            OrderId = orderId;
            PaymentTransactionId = paymentTransactionId;
            Amount = amount;
        }
    }
}
