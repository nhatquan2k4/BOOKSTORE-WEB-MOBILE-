using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

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

            return new BookMetadataDto
            {
                Id = metadata.Id,
                Key = metadata.Key,
                Value = metadata.Value,
                BookId = metadata.BookId
            };
        }

        public async Task<IEnumerable<BookMetadataDto>> GetByBookIdAsync(Guid bookId)
        {
            var metadata = await _bookMetadataRepository.GetByBookIdAsync(bookId);
            return metadata.Select(m => new BookMetadataDto
            {
                Id = m.Id,
                Key = m.Key,
                Value = m.Value,
                BookId = m.BookId
            });
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

            var metadata = new BookMetadata
            {
                Id = Guid.NewGuid(),
                Key = dto.Key,
                Value = dto.Value,
                BookId = dto.BookId
            };

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

            metadata.Key = dto.Key;
            metadata.Value = dto.Value;
            metadata.BookId = dto.BookId;

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