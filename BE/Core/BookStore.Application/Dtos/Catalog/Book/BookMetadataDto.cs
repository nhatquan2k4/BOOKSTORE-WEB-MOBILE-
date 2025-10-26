namespace BookStore.Application.DTOs.Catalog.Book
{
    public class BookMetadataDto
    {
        public Guid Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;

        public Guid BookId { get; set; }
        public virtual BookDto? Book { get; set; }
    }
}