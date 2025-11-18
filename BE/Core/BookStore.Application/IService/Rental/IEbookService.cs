using BookStore.Application.Dtos.Rental;

namespace BookStore.Application.IService.Rental
{
    public interface IEbookService
    {
        // Admin: Upload ebook file lên MinIO (PDF/EPUB) - upload trực tiếp
        Task<UploadEbookResultDto> UploadEbookAsync(Guid bookId, Stream fileStream, string fileName, string contentType);

        // Admin: Upload ebook ZIP (chứa PDF/EPUB bên trong, đã nén để upload nhanh hơn)
        Task<UploadEbookZipResultDto> UploadEbookZipAsync(Guid bookId, Stream zipStream, string zipFileName);

        // Admin: Upload CBZ (Comic Book ZIP - chứa chapters/ảnh cho truyện tranh)
        Task<UploadCbzResultDto> UploadCbzAsync(Guid bookId, Stream cbzStream, string cbzFileName);

        // User: Lấy link đọc ebook (Pre-signed URL có hạn 10 phút) - Cho PDF/EPUB
        Task<EbookAccessDto> GetEbookAccessLinkAsync(Guid userId, Guid bookId);

        // User: Lấy danh sách chapters (cho truyện tranh CBZ)
        Task<EbookChaptersDto> GetChaptersAsync(Guid userId, Guid bookId);

        // User: Lấy danh sách ảnh của 1 chapter (Pre-signed URLs)
        Task<ChapterPagesDto> GetChapterPagesAsync(Guid userId, Guid bookId, string chapterName);

        // Kiểm tra ebook có tồn tại không
        Task<bool> EbookExistsAsync(Guid bookId);

        // Admin: Xóa ebook file
        Task DeleteEbookAsync(Guid bookId);
    }
}
