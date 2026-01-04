namespace BookStore.Application.Dtos.Catalog.BookImages
{

    public class UpdateBookImageDto
    {
        public Guid Id { get; set; }
        public bool IsCover { get; set; }
        public int DisplayOrder { get; set; }
    }
}
