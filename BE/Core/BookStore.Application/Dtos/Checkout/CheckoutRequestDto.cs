using BookStore.Application.Dtos.Ordering;

namespace BookStore.Application.Dtos.Checkout
{
    public class CheckoutRequestDto
    {
        public Guid UserId { get; set; }
        public CreateOrderAddressDto Address { get; set; } = null!;
        public string? CouponCode { get; set; }
        public string Provider { get; set; } = "VietQR";
        public string PaymentMethod { get; set; } = "Online";
        public string? Note { get; set; }
    }
}
