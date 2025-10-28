using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface ICategoryRepository : IGenericRepository<Category>
    {
        Task<IEnumerable<Category>> GetSubCategoriesAsync(Guid parentId);
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
    }
}