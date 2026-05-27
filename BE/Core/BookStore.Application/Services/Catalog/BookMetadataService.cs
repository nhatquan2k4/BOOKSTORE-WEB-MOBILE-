using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog;
using BookStore.Domain.IRepository.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookMetadataService : IBookMetadataService
    {
        private readonly IBookMetadataRepository _bookMetadataRepository;
        private readonly IBookRepository _bookRepository;

        public BookMetadataService(
            IBookMetadataRepository bookMetadataRepository,
            IBookRepository bookRepository)
        {
            _bookMetadataRepository = bookMetadataRepository;
            _bookRepository = bookRepository;
        }

        public async Task<BookMetadataDto?> GetByIdAsync(Guid id)
        {
            var metadata = await _bookMetadataRepository.GetByIdAsync(id);
            if (metadata == null) return null;

            return metadata.ToDto();
        }

        public async Task<IEnumerable<BookMetadataDto>> GetByBookIdAsync(Guid bookId)
        {
            var metadata = await _bookMetadataRepository.GetByBookIdAsync(bookId);
            return metadata.ToDtoList();
        }

        public async Task<BookMetadataDto> CreateAsync(BookMetadataDto dto)
        {
            // ✅ VALIDATION: Kiểm tra Book có tồn tại không
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            if (book == null)
            {
                throw new InvalidOperationException($"Sách với ID {dto.BookId} không tồn tại");
            }

            // ✅ VALIDATION: Kiểm tra Key không trống
            if (string.IsNullOrWhiteSpace(dto.Key))
            {
                throw new ArgumentException("Key không được để trống");
            }

            var metadata = dto.ToEntity();

            await _bookMetadataRepository.AddAsync(metadata);
            await _bookMetadataRepository.SaveChangesAsync();

            dto.Id = metadata.Id;
            return dto;
        }

        public async Task<BookMetadataDto> UpdateAsync(BookMetadataDto dto)
        {
            var metadata = await _bookMetadataRepository.GetByIdAsync(dto.Id);
            if (metadata == null)
            {
                throw new InvalidOperationException("Metadata sách không tồn tại");
            }

            metadata.UpdateFromDto(dto);

            _bookMetadataRepository.Update(metadata);
            await _bookMetadataRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var metadata = await _bookMetadataRepository.GetByIdAsync(id);
            if (metadata == null) return false;

            _bookMetadataRepository.Delete(metadata);
            await _bookMetadataRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteByBookIdAsync(Guid bookId)
        {
            await _bookMetadataRepository.DeleteByBookIdAsync(bookId);
            await _bookMetadataRepository.SaveChangesAsync();

            return true;
        }
    }
}
