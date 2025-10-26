namespace BookStore.Application.DTOs.Catalog.Book
{
    public class BookFormatDto
    {
        public Guid Id { get; set; }
        public string FormatType { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}