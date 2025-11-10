using BookStore.Application.Dtos.Ordering;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.Application.Dtos.Checkout
{
    public class CheckoutResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public OrderDto? Order { get; set; }
        public PaymentDto.PaymentTransactionDto? Payment { get; set; }
        public string? PaymentUrl { get; set; }
        public string? QrCodeUrl { get; set; }
    }
}
