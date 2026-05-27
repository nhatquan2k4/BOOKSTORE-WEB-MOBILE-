using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Book;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

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
            return files.ToDtoList();
        }

        public async Task<BookFileDto?> GetByIdAsync(Guid id)
        {
            var file = await _bookFileRepository.GetByIdAsync(id);
            if (file == null) return null;

            return file.ToDto();
        }

        public async Task<BookFileDto> CreateAsync(BookFileDto dto)
        {
            // Validate inputs
            Guard.AgainstNullOrWhiteSpace(dto.FileUrl, nameof(dto.FileUrl));
            Guard.AgainstNullOrWhiteSpace(dto.FileType, nameof(dto.FileType));

            var file = dto.ToEntity();

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
                throw new NotFoundException($"Không tìm thấy file sách với ID {dto.Id}");
            }

            // Validate inputs
            Guard.AgainstNullOrWhiteSpace(dto.FileUrl, nameof(dto.FileUrl));
            Guard.AgainstNullOrWhiteSpace(dto.FileType, nameof(dto.FileType));

            file.UpdateFromDto(dto);

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
