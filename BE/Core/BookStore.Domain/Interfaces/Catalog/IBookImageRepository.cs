using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookImageRepository : IGenericRepository<BookImage>
    {
        Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId);
        Task DeleteByBookIdAsync(Guid bookId);
    }
}