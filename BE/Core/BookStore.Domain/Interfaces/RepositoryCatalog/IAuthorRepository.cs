using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IAuthorRepository : IGenericRepository<Author>
    {
        Task<Author?> GetByNameAsync(string name);
        Task<IEnumerable<Author>> SearchByNameAsync(string searchTerm);
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}