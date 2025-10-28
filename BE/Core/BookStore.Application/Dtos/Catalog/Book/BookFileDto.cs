namespace BookStore.Application.Dtos.Catalog.Book
{
    public class BookFileDto
    {
        public Guid Id { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }

        public bool IsPreview { get; set; }

        public Guid BookId { get; set; }

        public virtual BookDto? Book { get; set; }
    }
}