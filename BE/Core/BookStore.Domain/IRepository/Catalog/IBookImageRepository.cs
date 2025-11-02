using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.IRepository.Catalog
{
    public interface IBookImageRepository : IGenericRepository<BookImage>
    {
        Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId);
        Task DeleteByBookIdAsync(Guid bookId);
    }
}