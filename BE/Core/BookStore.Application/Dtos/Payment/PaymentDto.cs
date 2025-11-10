namespace BookStore.Application.Dtos.Payment
{
    public class PaymentTransactionDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Provider { get; set; } = "VietQR";
        public string TransactionCode { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Online";
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }

    public class CreatePaymentDto
    {
        public Guid OrderId { get; set; }
        public string Provider { get; set; } = "VietQR";
        public string PaymentMethod { get; set; } = "Online";
        public decimal Amount { get; set; }
    }

    public class UpdatePaymentStatusDto
    {
        public Guid PaymentId { get; set; }
        public string TransactionCode { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
    }

    public class PaymentCallbackDto
    {
        public string TransactionCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaidAt { get; set; }
        public string? Message { get; set; }
    }
}
