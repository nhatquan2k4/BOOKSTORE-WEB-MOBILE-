using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IPublisherRepository : IGenericRepository<Publisher>
    {
        Task<Publisher?> GetByNameAsync(string name);
        Task<IEnumerable<Publisher>> SearchByNameAsync(string searchTerm);
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}