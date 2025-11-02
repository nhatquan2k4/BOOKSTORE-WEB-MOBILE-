using System;

namespace BookStore.Domain.Events
{
    public sealed class RefundProcessed
    {
        public Guid RefundId { get; }
        public Guid PaymentTransactionId { get; }
        public decimal Amount { get; }
        public bool Succeeded { get; }
        public DateTime OccurredAt { get; } = DateTime.UtcNow;

        public RefundProcessed(Guid refundId, Guid paymentTransactionId, decimal amount, bool succeeded)
        {
            RefundId = refundId;
            PaymentTransactionId = paymentTransactionId;
            Amount = amount;
            Succeeded = succeeded;
        }
    }
}
