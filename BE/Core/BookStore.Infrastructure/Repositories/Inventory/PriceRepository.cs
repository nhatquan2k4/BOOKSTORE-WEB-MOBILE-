using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Inventory
{
    public class PriceRepository : GenericRepository<Price>, IPriceRepository
    {
        public PriceRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Price?> GetCurrentPriceByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(p => p.BookId == bookId && p.IsCurrent)
                .Include(p => p.Book)
                .Include(p => p.Discount)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Price>> GetPriceHistoryByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(p => p.BookId == bookId)
                .Include(p => p.Discount)
                .OrderByDescending(p => p.EffectiveFrom)
                .ToListAsync();
        }

        public async Task<IEnumerable<Price>> GetAllCurrentPricesAsync()
        {
            return await _dbSet
                .Where(p => p.IsCurrent)
                .Include(p => p.Book)
                .OrderBy(p => p.Book.Title)
                .ToListAsync();
        }

        public async Task DeactivateCurrentPriceAsync(Guid bookId)
        {
            var currentPrices = await _dbSet
                .Where(p => p.BookId == bookId && p.IsCurrent)
                .ToListAsync();

            foreach (var price in currentPrices)
            {
                price.IsCurrent = false;
                price.EffectiveTo = DateTime.UtcNow;
            }

            await SaveChangesAsync();
        }

        public async Task<IEnumerable<Price>> GetBooksByPriceRangeAsync(decimal minPrice, decimal maxPrice)
        {
            return await _dbSet
                .Where(p => p.IsCurrent && p.Amount >= minPrice && p.Amount <= maxPrice)
                .Include(p => p.Book)
                .OrderBy(p => p.Amount)
                .ToListAsync();
        }

        public async Task BulkUpdatePricesAsync(List<Price> prices)
        {
            _dbSet.UpdateRange(prices);
            await SaveChangesAsync();
        }
    }
}
