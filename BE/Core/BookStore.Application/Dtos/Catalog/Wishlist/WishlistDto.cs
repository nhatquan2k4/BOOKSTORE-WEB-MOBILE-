namespace BookStore.Application.Dtos.Catalog.Wishlist
{
    public class WishlistDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Book information
        public string BookTitle { get; set; } = string.Empty;
        public string? BookISBN { get; set; }
        public string? BookImageUrl { get; set; }
        public decimal? BookPrice { get; set; }
        public decimal? BookDiscountPrice { get; set; }
        public string? AuthorNames { get; set; }
        public string? PublisherName { get; set; }
    }

    public class WishlistItemDto
    {
        public Guid BookId { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class AddToWishlistRequest
    {
        public Guid BookId { get; set; }
    }

    public class WishlistSummaryDto
    {
        public int TotalItems { get; set; }
        public List<Guid> BookIds { get; set; } = new();
    }
}
