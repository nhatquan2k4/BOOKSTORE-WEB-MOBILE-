namespace BookStore.Application.Dtos.Catalog.Author
{
    public class AuthorDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? AvartarUrl { get; set; }
        public int BookCount { get; set; }
    }
}