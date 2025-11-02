using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class AuthorRepository : GenericRepository<Author>, IAuthorRepository
    {
        public AuthorRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Author?> GetByNameAsync(string name)
        {
            return await _dbSet
                .FirstOrDefaultAsync(a => a.Name == name);
        }

        public async Task<IEnumerable<Author>> SearchByNameAsync(string searchTerm)
        {
            return await _dbSet
                .Where(a => a.Name.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            var query = _dbSet.Where(a => a.Name == name);

            if (excludeId.HasValue)
            {
                query = query.Where(a => a.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}