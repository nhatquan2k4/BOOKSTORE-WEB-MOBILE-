using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.Dtos.Catalog.BookImages;
// using BookStore.Application.Dtos.Catalog.Review;

namespace BookStore.Application.Dtos.Catalog.Book
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
        
        // Pricing
        public decimal? CurrentPrice { get; set; }
        public decimal? DiscountPrice { get; set; }
        
        // Stock
        public int? StockQuantity { get; set; }
        
        public PublisherDto Publisher { get; set; } = null!;
        public BookFormatDto? BookFormat { get; set; }
        public List<AuthorDto> Authors { get; set; } = new();
        public List<CategoryDto> Categories { get; set; } = new();
        public List<BookImageDto> Images { get; set; } = new();
        public List<BookFileDto> Files { get; set; } = new();
        public List<BookMetadataDto> Metadata { get; set; } = new();
    }
}