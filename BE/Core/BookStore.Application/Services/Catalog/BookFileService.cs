using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookFileService : IBookFileService
    {
        private readonly IBookFileRepository _bookFileRepository;

        public BookFileService(IBookFileRepository bookFileRepository)
        {
            _bookFileRepository = bookFileRepository;
        }

        public async Task<IEnumerable<BookFileDto>> GetAllAsync()
        {
            var files = await _bookFileRepository.GetAllAsync();
            return files.Select(f => new BookFileDto
            {
                Id = f.Id,
                FileUrl = f.FileUrl,
                FileType = f.FileType,
                FileSize = f.FileSize,
                IsPreview = f.IsPreview,
                BookId = f.BookId
            });
        }

        public async Task<BookFileDto?> GetByIdAsync(Guid id)
        {
            var file = await _bookFileRepository.GetByIdAsync(id);
            if (file == null) return null;

            return new BookFileDto
            {
                Id = file.Id,
                FileUrl = file.FileUrl,
                FileType = file.FileType,
                FileSize = file.FileSize,
                IsPreview = file.IsPreview,
                BookId = file.BookId
            };
        }

        public async Task<BookFileDto> CreateAsync(BookFileDto dto)
        {
            var file = new BookFile
            {
                Id = Guid.NewGuid(),
                FileUrl = dto.FileUrl,
                FileType = dto.FileType,
                FileSize = dto.FileSize,
                IsPreview = dto.IsPreview,
                BookId = dto.BookId
            };

            await _bookFileRepository.AddAsync(file);
            await _bookFileRepository.SaveChangesAsync();

            dto.Id = file.Id;
            return dto;
        }

        public async Task<BookFileDto> UpdateAsync(BookFileDto dto)
        {
            var file = await _bookFileRepository.GetByIdAsync(dto.Id);
            if (file == null)
            {
                throw new InvalidOperationException("File sách không tồn tại");
            }

            file.FileUrl = dto.FileUrl;
            file.FileType = dto.FileType;
            file.FileSize = dto.FileSize;
            file.IsPreview = dto.IsPreview;
            file.BookId = dto.BookId;

            _bookFileRepository.Update(file);
            await _bookFileRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var file = await _bookFileRepository.GetByIdAsync(id);
            if (file == null) return false;

            _bookFileRepository.Delete(file);
            await _bookFileRepository.SaveChangesAsync();

            return true;
        }
    }
}