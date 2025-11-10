namespace BookStore.Application.Dtos.Checkout
{
    public class CheckoutCalculationDto
    {
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CouponCode { get; set; }
        public bool CouponApplied { get; set; }
    }
}
