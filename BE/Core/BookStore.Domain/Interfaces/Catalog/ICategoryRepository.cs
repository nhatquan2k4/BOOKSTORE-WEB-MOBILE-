using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface ICategoryRepository : IGenericRepository<Category>
    {
        Task<IEnumerable<Category>> GetSubCategoriesAsync(Guid parentId);
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
    }
}