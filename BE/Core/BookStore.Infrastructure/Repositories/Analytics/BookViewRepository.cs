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

        public async Task<IReadOnlyList<(Guid BookId, string BookTitle, string? BookCoverUrl, int ViewCount, int UniqueViewers)>> GetTopViewedBookStatsAsync(DateTime from, DateTime to, int top = 10)
        {
            var stats = await _context.BookViews
                .Where(bv => bv.ViewedAt >= from && bv.ViewedAt <= to)
                .GroupBy(bv => bv.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    ViewCount = g.Count(),
                    UniqueViewers = g
                        .Where(view => view.UserId.HasValue)
                        .Select(view => view.UserId)
                        .Distinct()
                        .Count()
                })
                .OrderByDescending(x => x.ViewCount)
                .Take(top)
                .ToListAsync();

            var bookIds = stats.Select(x => x.BookId).ToList();
            var books = await _context.Books
                .Where(book => bookIds.Contains(book.Id))
                .Include(book => book.Images)
                .ToDictionaryAsync(book => book.Id);

            return stats
                .Where(stat => books.ContainsKey(stat.BookId))
                .Select(stat =>
                {
                    var book = books[stat.BookId];
                    return (
                        stat.BookId,
                        book.Title,
                        book.Images
                            .OrderBy(image => image.DisplayOrder)
                            .FirstOrDefault()?.ImageUrl,
                        stat.ViewCount,
                        stat.UniqueViewers);
                })
                .ToList();
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
