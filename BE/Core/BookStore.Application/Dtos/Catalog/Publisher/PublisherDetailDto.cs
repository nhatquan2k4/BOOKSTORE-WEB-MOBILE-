using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.Dtos.Catalog.Publisher
{
    public class PublisherDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int BookCount { get; set; }
        public List<BookDto> Books { get; set; } = new List<BookDto>();
    }
}
