namespace BookStore.Application.Dtos.Catalog.BookImages
{

    public class CreateBookImageDto
    {
        public Guid BookId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public bool IsCover { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
    }
}
