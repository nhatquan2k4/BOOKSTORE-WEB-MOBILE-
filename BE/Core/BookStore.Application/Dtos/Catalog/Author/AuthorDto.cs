namespace BookStore.Application.DTOs.Catalog.Author
{
    public class AuthorDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Biography { get; set; }
        public string? AvartarUrl { get; set; }
    }
}