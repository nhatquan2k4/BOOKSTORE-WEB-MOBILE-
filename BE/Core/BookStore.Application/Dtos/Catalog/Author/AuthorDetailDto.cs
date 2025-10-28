using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.Dtos.Catalog.Author
{
    public class AuthorDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Biography { get; set; }
        public string? AvartarUrl { get; set; }
        public int BookCount { get; set; }
        public List<BookDto> Books { get; set; } = new List<BookDto>();
    }
}
