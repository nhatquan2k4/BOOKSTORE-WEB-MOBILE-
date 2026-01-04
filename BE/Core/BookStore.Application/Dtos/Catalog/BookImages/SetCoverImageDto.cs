namespace BookStore.Application.Dtos.Catalog.BookImages
{

    public class SetCoverImageDto
    {
        public Guid BookId { get; set; }
        public Guid ImageId { get; set; }
    }
}
