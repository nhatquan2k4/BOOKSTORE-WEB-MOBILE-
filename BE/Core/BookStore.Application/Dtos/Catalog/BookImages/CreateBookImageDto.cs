namespace BookStore.Application.Dtos.Catalog.BookImages
{
    /// <summary>
    /// DTO để tạo mới BookImage
    /// </summary>
    public class CreateBookImageDto
    {
        public Guid BookId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public bool IsCover { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
    }
}
