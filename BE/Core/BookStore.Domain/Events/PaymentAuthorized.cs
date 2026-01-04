using System;

namespace BookStore.Domain.Events
{

    public sealed class PaymentAuthorized
    {
        public Guid OrderId { get; }
        public string Provider { get; }
        public string ProviderTransactionCode { get; }
        public DateTime OccurredAt { get; } = DateTime.UtcNow;

        public PaymentAuthorized(Guid orderId, string provider, string providerTransactionCode)
        {
            OrderId = orderId;
            Provider = provider;
            ProviderTransactionCode = providerTransactionCode;
        }
    }
}
