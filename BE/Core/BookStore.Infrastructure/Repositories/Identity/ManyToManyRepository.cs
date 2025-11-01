using BookStore.Domain.IRepository.Identity;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity
{
    /// <summary>
    /// Base implementation cho Many-to-Many relationship repositories
    /// </summary>
    public abstract class ManyToManyRepository<TEntity> : IManyToManyRepository<TEntity> 
        where TEntity : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<TEntity> _dbSet;

        protected ManyToManyRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<TEntity>();
        }

        public abstract Task<IEnumerable<TEntity>> GetByLeftKeyAsync(Guid leftId);
        public abstract Task<IEnumerable<TEntity>> GetByRightKeyAsync(Guid rightId);
        public abstract Task RemoveAsync(Guid leftId, Guid rightId);
        public abstract Task RemoveAllByLeftKeyAsync(Guid leftId);
        public abstract Task<bool> ExistsAsync(Guid leftId, Guid rightId);

        public virtual async Task AddAsync(TEntity entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public virtual async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
