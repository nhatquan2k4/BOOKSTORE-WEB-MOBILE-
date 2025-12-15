using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.IRepository.Analytics;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Analytics
{
    public class BookViewRepository : GenericRepository<BookView>, IBookViewRepository
    {
        public BookViewRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<BookView>> GetByBookIdAsync(Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.BookViews
                .Where(bv => bv.BookId == bookId)
                .OrderByDescending(bv => bv.ViewedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<BookView>> GetByUserIdAsync(Guid userId, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.BookViews
                .Where(bv => bv.UserId == userId)
                .OrderByDescending(bv => bv.ViewedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetViewCountByBookIdAsync(Guid bookId, DateTime? from = null, DateTime? to = null)
        {
            var query = _context.BookViews.Where(bv => bv.BookId == bookId);

            if (from.HasValue)
                query = query.Where(bv => bv.ViewedAt >= from.Value);

            if (to.HasValue)
                query = query.Where(bv => bv.ViewedAt <= to.Value);

            return await query.CountAsync();
        }

        public async Task<Dictionary<Guid, int>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            return await _context.BookViews
                .Where(bv => bv.ViewedAt >= from && bv.ViewedAt <= to)
                .GroupBy(bv => bv.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(top)
                .ToDictionaryAsync(x => x.BookId, x => x.Count);
        }

        public async Task<IEnumerable<BookView>> GetByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _context.BookViews
                .Where(bv => bv.ViewedAt >= from && bv.ViewedAt <= to)
                .OrderByDescending(bv => bv.ViewedAt)
                .ToListAsync();
        }
    }
}
