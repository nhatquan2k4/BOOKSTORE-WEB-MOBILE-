namespace BookStore.Application.Dtos.Cart
{
    public class CartDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public List<CartItemDto> Items { get; set; } = new();
        public int TotalItems => Items.Sum(i => i.Quantity);
        public decimal TotalAmount => Items.Sum(i => i.Subtotal);
    }

    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid CartId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public string? BookImageUrl { get; set; }
        public decimal BookPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => BookPrice * Quantity;
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Extra book info
        public string? AuthorNames { get; set; }
        public string? PublisherName { get; set; }
        public bool IsAvailable { get; set; }
        public int StockQuantity { get; set; }
    }
}
