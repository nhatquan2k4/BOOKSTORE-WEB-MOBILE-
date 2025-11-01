namespace BookStore.Application.Dtos.Catalog.BookImages
{
    /// <summary>
    /// DTO để thêm nhiều images cùng lúc cho một book (sử dụng URLs đã upload)
    /// </summary>
    public class UploadBookImagesDto
    {
        public Guid BookId { get; set; }
        public List<string> ImageUrls { get; set; } = new();

        /// <summary>
        /// Index của image sẽ là cover (0-based). Null nếu không có cover
        /// </summary>
        public int? CoverImageIndex { get; set; }
    }
}
