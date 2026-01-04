namespace BookStore.Application.Dtos.Catalog.BookImages
{

    public class BookImageDto
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsCover { get; set; }
        public int DisplayOrder { get; set; }
        public Guid BookId { get; set; }
    }
}
