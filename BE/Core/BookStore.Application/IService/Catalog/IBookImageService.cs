using BookStore.Application.Dtos.Catalog.BookImages;

namespace BookStore.Application.IService.Catalog
{
    public interface IBookImageService
    {
        /// <summary>
        /// Lấy tất cả images (tất cả sách)
        /// </summary>
        Task<IEnumerable<BookImageDto>> GetAllImagesAsync();

        /// <summary>
        /// Lấy tất cả images của một book
        /// </summary>
        Task<IEnumerable<BookImageDto>> GetImagesByBookIdAsync(Guid bookId);

        /// <summary>
        /// Lấy thông tin chi tiết của một image
        /// </summary>
        Task<BookImageDto?> GetImageByIdAsync(Guid id);


        /// <summary>
        /// [DEPRECATED] Upload một image mới cho book với URL có sẵn
        /// </summary>
        // Task<BookImageDto> UploadImageAsync(CreateBookImageDto dto);

        /// <summary>
        /// [DEPRECATED] Upload nhiều images cùng lúc cho book với URLs có sẵn
        /// </summary>
        // Task<IEnumerable<BookImageDto>> UploadImagesAsync(UploadBookImagesDto dto);


        /// <summary>
        /// Cập nhật thông tin image (IsCover, DisplayOrder)
        /// </summary>
        Task<BookImageDto> UpdateImageAsync(UpdateBookImageDto dto);

        /// <summary>
        /// Xóa một image (xóa cả file trên MinIO và DB)
        /// </summary>
        Task<bool> DeleteImageAsync(Guid id);

        /// <summary>
        /// Xóa tất cả images của một book
        /// </summary>
        Task<bool> DeleteImagesByBookIdAsync(Guid bookId);

        /// <summary>
        /// Set một image làm cover của book (unset cover cũ)
        /// </summary>
        Task<bool> SetCoverImageAsync(SetCoverImageDto dto);

        /// <summary>
        /// Lấy cover image của book
        /// </summary>
        Task<BookImageDto?> GetCoverImageAsync(Guid bookId);

        /// <summary>
        /// Upload file trực tiếp lên MinIO và lưu vào DB (Single file)
        /// </summary>
        Task<BookImageDto> UploadFileAsync(Guid bookId, Stream fileStream, string fileName, string contentType, bool isCover = false, int displayOrder = 0);

        /// <summary>
        /// Upload nhiều files trực tiếp lên MinIO và lưu vào DB (Batch)
        /// </summary>
        Task<IEnumerable<BookImageDto>> UploadFilesAsync(Guid bookId, List<(Stream stream, string fileName, string contentType)> files, int? coverImageIndex = null);
    }
}
