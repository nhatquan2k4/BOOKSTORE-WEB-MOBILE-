using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Category>> GetSubCategoriesAsync(Guid parentId)
        {
            return await _dbSet
                .Where(c => c.ParentId == parentId)
                .ToListAsync();
        }

        public async Task<bool> HasSubCategoriesAsync(Guid categoryId)
        {
            return await _dbSet
                .AnyAsync(c => c.ParentId == categoryId);
        }
    }
}