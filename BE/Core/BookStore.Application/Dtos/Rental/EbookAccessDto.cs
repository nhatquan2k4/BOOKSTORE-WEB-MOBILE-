namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO để lấy link đọc ebook (Pre-signed URL)
    /// </summary>
    public class EbookAccessDto
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string AccessUrl { get; set; } = string.Empty; // Pre-signed URL
        public DateTime ExpiresAt { get; set; } // Hết hạn sau 5-10 phút
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO để upload ebook file (Admin)
    /// </summary>
    public class UploadEbookDto
    {
        public Guid BookId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty; // application/pdf, application/epub+zip
    }

    /// <summary>
    /// DTO response sau khi upload ebook thành công
    /// </summary>
    public class UploadEbookResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? FileUrl { get; set; } // URL file trong MinIO
        public string? FileName { get; set; }
    }
}
