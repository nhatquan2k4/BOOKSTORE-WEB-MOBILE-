namespace BookStore.Application.Dtos.Catalog.Book
{
    public class BookImageDto
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsCover { get; set; }
        public int DisplayOrder { get; set; }

        public Guid BookId { get; set; }

        public virtual BookDto? Book { get; set; }

    }
}