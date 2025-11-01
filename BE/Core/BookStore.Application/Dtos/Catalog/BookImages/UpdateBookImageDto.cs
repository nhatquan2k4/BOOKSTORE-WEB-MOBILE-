namespace BookStore.Application.Dtos.Catalog.BookImages
{
    /// <summary>
    /// DTO để cập nhật thông tin BookImage (không update file)
    /// </summary>
    public class UpdateBookImageDto
    {
        public Guid Id { get; set; }
        public bool IsCover { get; set; }
        public int DisplayOrder { get; set; }
    }
}
