namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO cho việc upload ebook được nén dạng ZIP (chứa file PDF/EPUB bên trong)
    /// Mục đích: Giảm dung lượng upload, tăng tốc độ upload
    /// </summary>
    public class UploadEbookZipDto
    {
        public Guid BookId { get; set; }
        public string ZipFileName { get; set; } = string.Empty;
        public long OriginalSize { get; set; } // Size sau khi giải nén
        public long CompressedSize { get; set; } // Size file ZIP
    }

    /// <summary>
    /// Response sau khi upload ZIP thành công (PDF/EPUB)
    /// </summary>
    public class UploadEbookZipResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty; // Tên file PDF/EPUB gốc
        public long OriginalSize { get; set; }
        public long CompressedSize { get; set; }
        public decimal CompressionRatio { get; set; } // % giảm dung lượng
    }

    /// <summary>
    /// Response sau khi upload CBZ (truyện tranh - chứa chapters/ảnh)
    /// </summary>
    public class UploadCbzResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalChapters { get; set; }
        public int TotalPages { get; set; }
        public List<ChapterInfo> Chapters { get; set; } = new();
    }

    public class ChapterInfo
    {
        public string ChapterName { get; set; } = string.Empty;
        public int PageCount { get; set; }
    }

    /// <summary>
    /// DTO để lấy danh sách chapters của truyện
    /// </summary>
    public class EbookChaptersDto
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int TotalChapters { get; set; }
        public List<ChapterDto> Chapters { get; set; } = new();
    }

    public class ChapterDto
    {
        public string ChapterName { get; set; } = string.Empty;
        public int ChapterNumber { get; set; }
        public int PageCount { get; set; }
    }

    /// <summary>
    /// DTO để lấy danh sách ảnh của 1 chapter
    /// </summary>
    public class ChapterPagesDto
    {
        public Guid BookId { get; set; }
        public string ChapterName { get; set; } = string.Empty;
        public int TotalPages { get; set; }
        public List<PageDto> Pages { get; set; } = new();
        public DateTime ExpiresAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class PageDto
    {
        public int PageNumber { get; set; }
        public string ImageUrl { get; set; } = string.Empty; // Pre-signed URL
    }
}
