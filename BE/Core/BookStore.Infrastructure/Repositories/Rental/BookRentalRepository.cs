using BookStore.Domain.Entities.Rental;
using BookStore.Domain.IRepository.Rental;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Rental
{
    public class BookRentalRepository : GenericRepository<BookRental>, IBookRentalRepository
    {
        public BookRentalRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<BookRental>> GetByUserIdAsync(Guid userId, bool includeExpired = false)
        {
            var query = _dbSet
                .Include(r => r.Book)
                .Include(r => r.RentalPlan)
                .Include(r => r.User)
                .Where(r => r.UserId == userId);

            if (!includeExpired)
            {
                query = query.Where(r => r.Status == "Active" && r.EndDate > DateTime.UtcNow);
            }

            return await query
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BookRental>> GetByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Include(r => r.Book)
                .Include(r => r.RentalPlan)
                .Include(r => r.User)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();
        }

        public async Task<BookRental?> GetActiveRentalAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .Include(r => r.Book)
                .Include(r => r.RentalPlan)
                .Include(r => r.User)
                .Where(r => r.UserId == userId && r.BookId == bookId)
                .Where(r => r.Status == "Active" && r.EndDate > DateTime.UtcNow && !r.IsReturned)
                .FirstOrDefaultAsync();
        }

        public async Task<BookRental?> GetDetailByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(r => r.Book)
                    .ThenInclude(b => b.Images)
                .Include(r => r.RentalPlan)
                .Include(r => r.User)
                .Include(r => r.Histories)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<BookRental>> GetExpiredRentalsAsync()
        {
            return await _dbSet
                .Where(r => r.Status == "Active" && r.EndDate <= DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task<bool> HasActiveRentalAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .AnyAsync(r => r.UserId == userId 
                    && r.BookId == bookId 
                    && r.Status == "Active" 
                    && r.EndDate > DateTime.UtcNow 
                    && !r.IsReturned);
        }

        public async Task<Dictionary<string, int>> GetRentalCountByStatusAsync()
        {
            return await _dbSet
                .GroupBy(r => r.Status ?? "Unknown")
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);
        }
    }
}
