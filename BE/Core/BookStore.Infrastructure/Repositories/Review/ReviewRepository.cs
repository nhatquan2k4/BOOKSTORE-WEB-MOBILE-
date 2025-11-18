using BookStore.Domain.Entities.Common;
using BookStore.Domain.IRepository.Review;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Review
{
    public class ReviewRepository : GenericRepository<Domain.Entities.Common.Review>, IReviewRepository
    {
        public ReviewRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Domain.Entities.Common.Review?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(r => r.User)
                    .ThenInclude(u => u.Profiles)
                .Include(r => r.Book)
                .Include(r => r.Order)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Domain.Entities.Common.Review>> GetApprovedReviewsByBookIdAsync(Guid bookId, int page, int pageSize, string? sortBy = null)
        {
            var query = _dbSet
                .Include(r => r.User)
                    .ThenInclude(u => u.Profiles)
                .Where(r => r.BookId == bookId && r.Status == "Approved" && !r.IsDeleted);

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "rating_desc" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "rating_asc" => query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "oldest" => query.OrderBy(r => r.CreatedAt),
                _ => query.OrderByDescending(r => r.CreatedAt) // Default: newest first
            };

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> HasUserPurchasedBookAsync(Guid userId, Guid bookId)
        {
            // Check if user has a completed/delivered order containing this book
            return await _context.Orders
                .Where(o => o.UserId == userId && 
                           (o.Status == "Completed" || o.Status == "Delivered"))
                .SelectMany(o => o.Items)
                .AnyAsync(item => item.BookId == bookId);
        }

        public async Task<bool> HasUserReviewedBookAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .AnyAsync(r => r.UserId == userId && r.BookId == bookId && !r.IsDeleted);
        }

        public async Task<Domain.Entities.Common.Review?> GetUserReviewForBookAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .Include(r => r.Book)
                .Include(r => r.Order)
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId && !r.IsDeleted);
        }

        public async Task<int> GetTotalReviewsCountByBookIdAsync(Guid bookId, bool approvedOnly = true)
        {
            var query = _dbSet.Where(r => r.BookId == bookId && !r.IsDeleted);
            
            if (approvedOnly)
                query = query.Where(r => r.Status == "Approved");

            return await query.CountAsync();
        }

        public async Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid bookId)
        {
            var reviews = await _dbSet
                .Where(r => r.BookId == bookId && r.Status == "Approved" && !r.IsDeleted)
                .GroupBy(r => r.Rating)
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .ToListAsync();

            var distribution = new Dictionary<int, int>();
            for (int i = 1; i <= 5; i++)
            {
                distribution[i] = reviews.FirstOrDefault(r => r.Rating == i)?.Count ?? 0;
            }

            return distribution;
        }

        public async Task<IEnumerable<Domain.Entities.Common.Review>> GetPendingReviewsAsync(int page, int pageSize)
        {
            return await _dbSet
                .Include(r => r.User)
                    .ThenInclude(u => u.Profiles)
                .Include(r => r.Book)
                .Where(r => r.Status == "Pending" && !r.IsDeleted)
                .OrderBy(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetPendingReviewsCountAsync()
        {
            return await _dbSet
                .CountAsync(r => r.Status == "Pending" && !r.IsDeleted);
        }
    }
}
