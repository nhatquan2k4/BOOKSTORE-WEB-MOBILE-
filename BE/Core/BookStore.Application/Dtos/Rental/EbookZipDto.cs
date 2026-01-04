namespace BookStore.Application.Dtos.Rental
{
    public class UploadEbookZipDto
    {
        public Guid BookId { get; set; }
        public string ZipFileName { get; set; } = string.Empty;
        public long OriginalSize { get; set; } // Size sau khi giải nén
        public long CompressedSize { get; set; } // Size file ZIP
    }


    public class UploadEbookZipResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty; // Tên file PDF/EPUB gốc
        public long OriginalSize { get; set; }
        public long CompressedSize { get; set; }
        public decimal CompressionRatio { get; set; } // % giảm dung lượng
    }


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
