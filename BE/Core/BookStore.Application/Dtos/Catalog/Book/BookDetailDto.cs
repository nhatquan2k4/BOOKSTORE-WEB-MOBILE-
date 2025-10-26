using BookStore.Application.DTOs.Catalog.Author;
using BookStore.Application.DTOs.Catalog.Category;
using BookStore.Application.DTOs.Catalog.Publisher;
using BookStore.Application.DTOs.Catalog.Review;

namespace BookStore.Application.DTOs.Catalog.Book
{
    public class BookDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PublicationYear { get; set; }
        public string Language { get; set; } = string.Empty;
        public string? Edition { get; set; }
        public int PageCount { get; set; }
        public bool IsAvailable { get; set; }
        public PublisherDto Publisher { get; set; } = null!;
        public BookFormatDto? BookFormat { get; set; }
        public List<AuthorDto> Authors { get; set; } = new();
        public List<CategoryDto> Categories { get; set; } = new();
        public List<BookImageDto> Images { get; set; } = new();
        public List<BookFileDto> Files { get; set; } = new();
        public List<BookMetadataDto> Metadata { get; set; } = new();
        // public decimal? CurrentPrice { get; set; }
        // public decimal? DiscountPrice { get; set; }
        // public decimal? FinalPrice { get; set; }
        // public decimal? DiscountPercentage { get; set; }
        // public int? StockQuantity { get; set; }
        // public bool InStock { get; set; }
        // public double? AverageRating { get; set; }
        // public int TotalReviews { get; set; }
        // public List<ReviewDto> RecentReviews { get; set; } = new();
        // public bool IsRentable { get; set; }
        // public decimal? RentalPricePerDay { get; set; }
    }
}