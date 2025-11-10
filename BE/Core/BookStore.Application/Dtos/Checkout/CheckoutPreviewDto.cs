using BookStore.Application.Dtos.Cart;

namespace BookStore.Application.Dtos.Checkout
{
    public class CheckoutPreviewDto
    {
        public Guid UserId { get; set; }
        public CartDto Cart { get; set; } = null!;
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CouponCode { get; set; }
        public bool IsValid { get; set; }
        public List<string> ValidationMessages { get; set; } = new();
    }
}
