using BookStore.Application.DTOs.Catalog.Book;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IBookMetadataService
    {
        Task<BookMetadataDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<BookMetadataDto>> GetByBookIdAsync(Guid bookId);
        Task<BookMetadataDto> CreateAsync(BookMetadataDto dto);
        Task<BookMetadataDto> UpdateAsync(BookMetadataDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByBookIdAsync(Guid bookId);
    }
}