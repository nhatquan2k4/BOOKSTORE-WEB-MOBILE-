using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookImageService : IBookImageService
    {
        private readonly IBookImageRepository _bookImageRepository;

        public BookImageService(IBookImageRepository bookImageRepository)
        {
            _bookImageRepository = bookImageRepository;
        }

        public async Task<IEnumerable<BookImageDto>> GetAllAsync()
        {
            var images = await _bookImageRepository.GetAllAsync();
            return images.Select(i => new BookImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsCover = i.IsCover,
                DisplayOrder = i.DisplayOrder,
                BookId = i.BookId
            });
        }

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