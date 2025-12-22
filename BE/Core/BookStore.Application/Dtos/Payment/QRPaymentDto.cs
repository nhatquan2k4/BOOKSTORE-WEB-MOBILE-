namespace BookStore.Application.Dtos.Payment
{
    public class CreateQRPaymentRequestDto
    {
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class CreateQRPaymentResponseDto
    {
        public bool Success { get; set; }
        public string QrCodeUrl { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string TransferContent { get; set; } = string.Empty;
    }
}
