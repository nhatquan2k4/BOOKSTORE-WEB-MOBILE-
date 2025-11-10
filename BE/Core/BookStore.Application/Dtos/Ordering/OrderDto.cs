using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.Dtos.Ordering
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Pending";
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        
        public List<OrderItemDto> Items { get; set; } = new();
        public OrderAddressDto Address { get; set; } = null!;
        public PaymentTransactionDto? PaymentTransaction { get; set; }
        
        public string? CouponCode { get; set; }
    }

    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public string? BookImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class OrderAddressDto
    {
        public Guid Id { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string? Note { get; set; }
        
        public string FullAddress => $"{Street}, {Ward}, {District}, {Province}";
    }

    public class PaymentTransactionDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string Provider { get; set; } = "VietQR";
        public string TransactionCode { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Online";
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
