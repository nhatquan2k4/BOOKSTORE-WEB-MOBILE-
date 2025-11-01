using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.BookImages;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;

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

        public async Task<BookImageDto> UploadImageAsync(CreateBookImageDto dto)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            if (book == null)
            {
                throw new InvalidOperationException($"Book with ID {dto.BookId} not found");
            }

            // Validate ImageUrl
            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                throw new InvalidOperationException("ImageUrl is required");
            }

            // If this image is set as cover, unset previous cover
            if (dto.IsCover)
            {
                await UnsetCurrentCoverAsync(dto.BookId);
            }

            // Create entity
            var bookImage = new BookImage
            {
                Id = Guid.NewGuid(),
                BookId = dto.BookId,
                ImageUrl = dto.ImageUrl,
                IsCover = dto.IsCover,
                DisplayOrder = dto.DisplayOrder
            };

            // Save to DB
            await _bookImageRepository.AddAsync(bookImage);
            await _bookImageRepository.SaveChangesAsync();

            return bookImage.ToDto();
        }

        public async Task<IEnumerable<BookImageDto>> UploadImagesAsync(UploadBookImagesDto dto)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            if (book == null)
            {
                throw new InvalidOperationException($"Book with ID {dto.BookId} not found");
            }

            // Validate all URLs
            if (dto.ImageUrls == null || !dto.ImageUrls.Any())
            {
                throw new InvalidOperationException("No image URLs provided");
            }

            if (dto.ImageUrls.Count > 10)
            {
                throw new InvalidOperationException("Maximum 10 images can be uploaded at once");
            }

            // Unset current cover if a new cover will be set
            if (dto.CoverImageIndex.HasValue && dto.CoverImageIndex >= 0 && dto.CoverImageIndex < dto.ImageUrls.Count)
            {
                await UnsetCurrentCoverAsync(dto.BookId);
            }

            // Get current max display order
            var existingImages = await _bookImageRepository.GetByBookIdAsync(dto.BookId);
            int currentMaxOrder = existingImages.Any() ? existingImages.Max(i => i.DisplayOrder) : -1;

            var uploadedImages = new List<BookImage>();

            // Create entities for each URL
            for (int i = 0; i < dto.ImageUrls.Count; i++)
            {
                var imageUrl = dto.ImageUrls[i];

                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    continue;
                }

                var bookImage = new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = dto.BookId,
                    ImageUrl = imageUrl,
                    IsCover = dto.CoverImageIndex == i,
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

        public async Task<BookImageDto> UpdateImageAsync(UpdateBookImageDto dto)
        {
            var bookImage = await _bookImageRepository.GetByIdAsync(dto.Id);
            if (bookImage == null)
            {
                throw new InvalidOperationException($"Book image with ID {dto.Id} not found");
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
            if (image == null || image.BookId != dto.BookId)
            {
                throw new InvalidOperationException("Image not found or does not belong to this book");
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

        #region Private Helper Methods

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

        #endregion
    }
}
