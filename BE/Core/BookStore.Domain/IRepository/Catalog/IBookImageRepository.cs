using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.IRepository.Catalog
{
    public interface IBookImageRepository : IGenericRepository<BookImage>
    {
        Task<IEnumerable<BookImage>> GetAllOrderedAsync();
        Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId);
        Task<BookImage?> GetCoverByBookIdAsync(Guid bookId);
        Task<int> GetMaxDisplayOrderAsync(Guid bookId);
        Task DeleteByBookIdAsync(Guid bookId);
    }
}
