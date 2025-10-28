using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IAuthorRepository : IGenericRepository<Author>
    {
        Task<Author?> GetByNameAsync(string name);
        Task<IEnumerable<Author>> SearchByNameAsync(string searchTerm);
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}