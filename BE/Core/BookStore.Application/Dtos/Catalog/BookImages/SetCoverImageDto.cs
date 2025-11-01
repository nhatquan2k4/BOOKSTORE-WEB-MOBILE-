namespace BookStore.Application.Dtos.Catalog.BookImages
{
    /// <summary>
    /// DTO để set một image làm cover của book
    /// </summary>
    public class SetCoverImageDto
    {
        public Guid BookId { get; set; }
        public Guid ImageId { get; set; }
    }
}
