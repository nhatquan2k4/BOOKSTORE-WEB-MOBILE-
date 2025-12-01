using BookStore.Application.Dtos.Catalog.BookImages;

namespace BookStore.Application.IService.Catalog
{
    public interface IBookImageService
    {
        // Lấy tất cả images (tất cả sách)
        Task<IEnumerable<BookImageDto>> GetAllImagesAsync();

        // Lấy tất cả images của một book
        Task<IEnumerable<BookImageDto>> GetImagesByBookIdAsync(Guid bookId);

        // Lấy thông tin chi tiết của một image
        Task<BookImageDto?> GetImageByIdAsync(Guid id);

        // Cập nhật thông tin image (IsCover, DisplayOrder)
        Task<BookImageDto> UpdateImageAsync(UpdateBookImageDto dto);


        // Xóa một image (xóa cả file trên MinIO và DB)
        Task<bool> DeleteImageAsync(Guid id);


        // Xóa tất cả images của một book
        Task<bool> DeleteImagesByBookIdAsync(Guid bookId);

        // Set một image làm cover của book
        Task<bool> SetCoverImageAsync(SetCoverImageDto dto);

        // Lấy cover image của book
        Task<BookImageDto?> GetCoverImageAsync(Guid bookId);

        // Upload file trực tiếp lên MinIO và lưu vào DB
        Task<BookImageDto> UploadFileAsync(Guid bookId, Stream fileStream, string fileName, string contentType, bool isCover = false, int displayOrder = 0);

        // Upload nhiều files trực tiếp lên MinIO và lưu vào DB
        Task<IEnumerable<BookImageDto>> UploadFilesAsync(Guid bookId, List<(Stream stream, string fileName, string contentType)> files, int? coverImageIndex = null);
    }
}
