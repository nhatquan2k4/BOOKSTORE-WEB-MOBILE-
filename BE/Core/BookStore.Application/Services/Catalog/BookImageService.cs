using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookImageService : IBookImageService
    {
        private readonly IBookImageRepository _bookImageRepository;
        private readonly IBookRepository _bookRepository;

        public BookImageService(
            IBookImageRepository bookImageRepository,
            IBookRepository bookRepository)
        {
            _bookImageRepository = bookImageRepository;
            _bookRepository = bookRepository;
        }

        // ❌ XÓA GetAllAsync() - Hình ảnh chỉ nên lấy theo BookId

        public async Task<BookImageDto?> GetByIdAsync(Guid id)
        {
            var image = await _bookImageRepository.GetByIdAsync(id);
            if (image == null) return null;

            return new BookImageDto
            {
                Id = image.Id,
                ImageUrl = image.ImageUrl,
                IsCover = image.IsCover,
                DisplayOrder = image.DisplayOrder,
                BookId = image.BookId
            };
        }

        public async Task<IEnumerable<BookImageDto>> GetByBookIdAsync(Guid bookId)
        {
            var images = await _bookImageRepository.GetByBookIdAsync(bookId);
            return images.Select(i => new BookImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsCover = i.IsCover,
                DisplayOrder = i.DisplayOrder,
                BookId = i.BookId
            });
        }

        public async Task<BookImageDto> CreateAsync(BookImageDto dto)
        {
            // ✅ VALIDATION: Kiểm tra Book có tồn tại không
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            if (book == null)
            {
                throw new InvalidOperationException($"Sách với ID {dto.BookId} không tồn tại");
            }

            // ✅ VALIDATION: Kiểm tra ImageUrl không trống
            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                throw new ArgumentException("URL hình ảnh không được để trống");
            }

            // ✅ BUSINESS LOGIC: Nếu là ảnh bìa, bỏ IsCover của ảnh cũ
            if (dto.IsCover)
            {
                var existingImages = await _bookImageRepository.GetByBookIdAsync(dto.BookId);
                foreach (var img in existingImages.Where(i => i.IsCover))
                {
                    img.IsCover = false;
                    _bookImageRepository.Update(img);
                }
            }

            var image = new BookImage
            {
                Id = Guid.NewGuid(),
                ImageUrl = dto.ImageUrl,
                IsCover = dto.IsCover,
                DisplayOrder = dto.DisplayOrder,
                BookId = dto.BookId
            };

            await _bookImageRepository.AddAsync(image);
            await _bookImageRepository.SaveChangesAsync();

            dto.Id = image.Id;
            return dto;
        }

        public async Task<BookImageDto> UpdateAsync(BookImageDto dto)
        {
            var image = await _bookImageRepository.GetByIdAsync(dto.Id);
            if (image == null)
            {
                throw new InvalidOperationException("Ảnh sách không tồn tại");
            }

            image.ImageUrl = dto.ImageUrl;
            image.IsCover = dto.IsCover;
            image.DisplayOrder = dto.DisplayOrder;
            image.BookId = dto.BookId;

            _bookImageRepository.Update(image);
            await _bookImageRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var image = await _bookImageRepository.GetByIdAsync(id);
            if (image == null) return false;

            _bookImageRepository.Delete(image);
            await _bookImageRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteByBookIdAsync(Guid bookId)
        {
            await _bookImageRepository.DeleteByBookIdAsync(bookId);
            await _bookImageRepository.SaveChangesAsync();

            return true;
        }
    }
}