namespace BookStore.Application.Dtos.Ordering
{
    public class CreateOrderDto
    {
        public Guid UserId { get; set; }
        
        // Items từ Cart
        public List<CreateOrderItemDto> Items { get; set; } = new();
        
        // Địa chỉ giao hàng
        public CreateOrderAddressDto Address { get; set; } = null!;
        
        // Coupon (optional)
        public Guid? CouponId { get; set; }
        public string? CouponCode { get; set; }
    }

    public class CreateOrderItemDto
    {
        public Guid BookId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateOrderAddressDto
    {
        public string RecipientName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
}
