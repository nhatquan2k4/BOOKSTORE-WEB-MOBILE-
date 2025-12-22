using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.BookImages;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Catalog
{
    public class BookImageService : IBookImageService
    {
        private readonly IBookImageRepository _bookImageRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IMinIOService _minIOService;
        private const string BOOK_IMAGES_BUCKET = "book-images";

        public BookImageService(
            IBookImageRepository bookImageRepository,
            IBookRepository bookRepository,
            IMinIOService minIOService)
        {
            _bookImageRepository = bookImageRepository;
            _bookRepository = bookRepository;
            _minIOService = minIOService;
        }

        public async Task<IEnumerable<BookImageDto>> GetAllImagesAsync()
        {
            var images = await _bookImageRepository.GetAllAsync();
            return images.OrderBy(i => i.BookId).ThenBy(i => i.DisplayOrder).ToDtoList();
        }

        public async Task<IEnumerable<BookImageDto>> GetImagesByBookIdAsync(Guid bookId)
        {
            var images = await _bookImageRepository.GetByBookIdAsync(bookId);
            return images.OrderBy(i => i.DisplayOrder).ToDtoList();
        }

        public async Task<BookImageDto?> GetImageByIdAsync(Guid id)
        {
            var image = await _bookImageRepository.GetByIdAsync(id);
            return image?.ToDto();
        }

        // public async Task<BookImageDto> UploadImageAsync(CreateBookImageDto dto)
        // {
        //     // Validate ImageUrl
        //     Guard.AgainstNullOrWhiteSpace(dto.ImageUrl, nameof(dto.ImageUrl));

        //     // Validate book exists
        //     var book = await _bookRepository.GetByIdAsync(dto.BookId);
        //     if (book == null)
        //     {
        //         throw new NotFoundException($"Không tìm thấy sách với ID {dto.BookId}");
        //     }

        //     // If this image is set as cover, unset previous cover
        //     if (dto.IsCover)
        //     {
        //         await UnsetCurrentCoverAsync(dto.BookId);
        //     }

        //     // Create entity
        //     var bookImage = new BookImage
        //     {
        //         Id = Guid.NewGuid(),
        //         BookId = dto.BookId,
        //         ImageUrl = dto.ImageUrl,
        //         IsCover = dto.IsCover,
        //         DisplayOrder = dto.DisplayOrder
        //     };

        //     // Save to DB
        //     await _bookImageRepository.AddAsync(bookImage);
        //     await _bookImageRepository.SaveChangesAsync();

        //     return bookImage.ToDto();
        // }

        // public async Task<IEnumerable<BookImageDto>> UploadImagesAsync(UploadBookImagesDto dto)
        // {
        //     // Validate all URLs
        //     Guard.Against(dto.ImageUrls == null || !dto.ImageUrls.Any(), "Phải cung cấp ít nhất một URL hình ảnh");
        //     Guard.Against(dto.ImageUrls!.Count > 10, "Chỉ có thể upload tối đa 10 hình ảnh cùng lúc");

        //     // Validate book exists
        //     var book = await _bookRepository.GetByIdAsync(dto.BookId);
        //     if (book == null)
        //     {
        //         throw new NotFoundException($"Không tìm thấy sách với ID {dto.BookId}");
        //     }

        //     // Unset current cover if a new cover will be set
        //     if (dto.CoverImageIndex.HasValue && dto.CoverImageIndex >= 0 && dto.CoverImageIndex < dto.ImageUrls.Count)
        //     {
        //         await UnsetCurrentCoverAsync(dto.BookId);
        //     }

        //     // Get current max display order
        //     var existingImages = await _bookImageRepository.GetByBookIdAsync(dto.BookId);
        //     int currentMaxOrder = existingImages.Any() ? existingImages.Max(i => i.DisplayOrder) : -1;

        //     var uploadedImages = new List<BookImage>();

        //     // Create entities for each URL
        //     for (int i = 0; i < dto.ImageUrls.Count; i++)
        //     {
        //         var imageUrl = dto.ImageUrls[i];

        //         if (string.IsNullOrWhiteSpace(imageUrl))
        //         {
        //             continue;
        //         }

        //         var bookImage = new BookImage
        //         {
        //             Id = Guid.NewGuid(),
        //             BookId = dto.BookId,
        //             ImageUrl = imageUrl,
        //             IsCover = dto.CoverImageIndex == i,
        //             DisplayOrder = currentMaxOrder + i + 1
        //         };

        //         uploadedImages.Add(bookImage);
        //     }

        //     // Save all to DB
        //     foreach (var image in uploadedImages)
        //     {
        //         await _bookImageRepository.AddAsync(image);
        //     }
        //     await _bookImageRepository.SaveChangesAsync();

        //     return uploadedImages.ToDtoList();
        // }

        public async Task<BookImageDto> UpdateImageAsync(UpdateBookImageDto dto)
        {
            var bookImage = await _bookImageRepository.GetByIdAsync(dto.Id);
            if (bookImage == null)
            {
                throw new NotFoundException($"Không tìm thấy hình ảnh sách với ID {dto.Id}");
            }

            // If setting as cover, unset previous cover
            if (dto.IsCover && !bookImage.IsCover)
            {
                await UnsetCurrentCoverAsync(bookImage.BookId);
            }

            // Update entity
            bookImage.UpdateFromDto(dto);

            // Save changes
            _bookImageRepository.Update(bookImage);
            await _bookImageRepository.SaveChangesAsync();

            return bookImage.ToDto();
        }

        public async Task<bool> DeleteImageAsync(Guid id)
        {
            var bookImage = await _bookImageRepository.GetByIdAsync(id);
            if (bookImage == null)
            {
                return false;
            }

            // Extract filename from URL to delete from MinIO
            var fileName = ExtractFileNameFromUrl(bookImage.ImageUrl);

            try
            {
                // Delete from MinIO
                await _minIOService.DeleteFileAsync(fileName, BOOK_IMAGES_BUCKET);
            }
            catch (Exception ex)
            {
                // Log error but continue with DB deletion
                Console.WriteLine($"Error deleting file from MinIO: {ex.Message}");
            }

            // Delete from DB
            _bookImageRepository.Delete(bookImage);
            await _bookImageRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteImagesByBookIdAsync(Guid bookId)
        {
            var images = await _bookImageRepository.GetByBookIdAsync(bookId);
            if (!images.Any())
            {
                return false;
            }

            // Delete all files from MinIO
            foreach (var image in images)
            {
                var fileName = ExtractFileNameFromUrl(image.ImageUrl);
                try
                {
                    await _minIOService.DeleteFileAsync(fileName, BOOK_IMAGES_BUCKET);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting file from MinIO: {ex.Message}");
                }
            }

            // Delete from DB
            await _bookImageRepository.DeleteByBookIdAsync(bookId);
            await _bookImageRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> SetCoverImageAsync(SetCoverImageDto dto)
        {
            // Validate image exists and belongs to the book
            var image = await _bookImageRepository.GetByIdAsync(dto.ImageId);
            if (image == null)
            {
                throw new NotFoundException($"Không tìm thấy hình ảnh với ID {dto.ImageId}");
            }

            if (image.BookId != dto.BookId)
            {
                throw new UserFriendlyException($"Hình ảnh không thuộc về sách với ID {dto.BookId}");
            }

            // Unset current cover
            await UnsetCurrentCoverAsync(dto.BookId);

            // Set new cover
            image.IsCover = true;
            _bookImageRepository.Update(image);
            await _bookImageRepository.SaveChangesAsync();

            return true;
        }

        public async Task<BookImageDto?> GetCoverImageAsync(Guid bookId)
        {
            var images = await _bookImageRepository.GetByBookIdAsync(bookId);
            var coverImage = images.FirstOrDefault(i => i.IsCover);
            return coverImage?.ToDto();
        }

        public async Task<BookImageDto> UploadFileAsync(
            Guid bookId,
            Stream fileStream,
            string fileName,
            string contentType,
            bool isCover = true,
            int displayOrder = 0)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
            {
                throw new NotFoundException($"Không tìm thấy sách với ID {bookId}");
            }

            // Generate unique filename with bookId prefix for better organization
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8); // Short GUID
            var uniqueFileName = $"book_{bookId}_{timestamp}_{uniqueId}{extension}";
            // Example: book_a1b2c3d4-e5f6-7890-abcd-ef1234567890_20251215120000_abc12345.jpg

            // Upload to MinIO
            var imageUrl = await _minIOService.UploadFileAsync(
                uniqueFileName,
                fileStream,
                contentType,
                BOOK_IMAGES_BUCKET);

            // Get current cover image (if exists) to delete after upload
            string? oldImageFileName = null;
            if (isCover)
            {
                var images = await _bookImageRepository.GetByBookIdAsync(bookId);
                var currentCover = images.FirstOrDefault(i => i.IsCover);

                if (currentCover != null)
                {
                    // Extract filename from old URL to delete later
                    oldImageFileName = ExtractFileNameFromUrl(currentCover.ImageUrl);

                    // Delete old cover from database
                    _bookImageRepository.Delete(currentCover);
                }
            }

            // Create entity
            var bookImage = new BookImage
            {
                Id = Guid.NewGuid(),
                BookId = bookId,
                ImageUrl = imageUrl,
                IsCover = isCover,
                DisplayOrder = displayOrder
            };

            // Save to DB
            await _bookImageRepository.AddAsync(bookImage);
            await _bookImageRepository.SaveChangesAsync();

            // Delete old image file from MinIO after successful DB update
            if (!string.IsNullOrEmpty(oldImageFileName))
            {
                try
                {
                    await _minIOService.DeleteFileAsync(oldImageFileName, BOOK_IMAGES_BUCKET);
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the upload
                    Console.WriteLine($"Warning: Could not delete old cover image from MinIO: {ex.Message}");
                }
            }

            return bookImage.ToDto();
        }

        public async Task<IEnumerable<BookImageDto>> UploadFilesAsync(
            Guid bookId,
            List<(Stream stream, string fileName, string contentType)> files,
            int? coverImageIndex = null)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
            {
                throw new NotFoundException($"Không tìm thấy sách với ID {bookId}");
            }

            Guard.Against(files == null || !files.Any(), "Phải cung cấp ít nhất một file");
            Guard.Against(files!.Count > 10, "Chỉ có thể upload tối đa 10 hình ảnh cùng lúc");

            // Unset current cover if a new cover will be set
            if (coverImageIndex.HasValue && coverImageIndex >= 0 && coverImageIndex < files.Count)
            {
                await UnsetCurrentCoverAsync(bookId);
            }

            // Get current max display order
            var existingImages = await _bookImageRepository.GetByBookIdAsync(bookId);
            int currentMaxOrder = existingImages.Any() ? existingImages.Max(i => i.DisplayOrder) : -1;

            var uploadedImages = new List<BookImage>();

            // Upload all files to MinIO and create entities
            for (int i = 0; i < files.Count; i++)
            {
                var (stream, fileName, contentType) = files[i];

                // Generate unique filename
                var extension = Path.GetExtension(fileName).ToLowerInvariant();
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";

                // Upload to MinIO
                var imageUrl = await _minIOService.UploadFileAsync(
                    uniqueFileName,
                    stream,
                    contentType,
                    BOOK_IMAGES_BUCKET);

                // Create entity
                var bookImage = new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = bookId,
                    ImageUrl = imageUrl,
                    IsCover = coverImageIndex == i,
                    DisplayOrder = currentMaxOrder + i + 1
                };

                uploadedImages.Add(bookImage);
            }

            // Save all to DB
            foreach (var image in uploadedImages)
            {
                await _bookImageRepository.AddAsync(image);
            }
            await _bookImageRepository.SaveChangesAsync();

            return uploadedImages.ToDtoList();
        }



        private string ExtractFileNameFromUrl(string url)
        {
            // Extract filename from URL
            // Example: https://minio.example.com/book-images/guid.jpg -> guid.jpg
            return Path.GetFileName(new Uri(url).LocalPath);
        }

        private async Task UnsetCurrentCoverAsync(Guid bookId)
        {
            var images = await _bookImageRepository.GetByBookIdAsync(bookId);
            var currentCover = images.FirstOrDefault(i => i.IsCover);

            if (currentCover != null)
            {
                currentCover.IsCover = false;
                _bookImageRepository.Update(currentCover);
            }
        }
    }
}
