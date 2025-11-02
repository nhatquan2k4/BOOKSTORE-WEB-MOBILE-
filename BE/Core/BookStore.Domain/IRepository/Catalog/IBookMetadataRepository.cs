using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.IRepository.Catalog
{
    public interface IBookMetadataRepository : IGenericRepository<BookMetadata>
    {
        Task<IEnumerable<BookMetadata>> GetByBookIdAsync(Guid bookId);
        Task DeleteByBookIdAsync(Guid bookId);
    }
}