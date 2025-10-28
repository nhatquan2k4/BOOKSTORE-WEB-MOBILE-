using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookImageRepository : IGenericRepository<BookImage>
    {
        Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId);
        Task DeleteByBookIdAsync(Guid bookId);
    }
}