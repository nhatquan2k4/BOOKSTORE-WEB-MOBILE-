using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookRepository : GenericRepository<Book>, IBookRepository
    {
        public BookRepository(AppDbContext context) : base(context)
        {
        }

        // Override GetAllAsync to include related entities
        // NOTE: Removed Reviews Include to avoid schema issues
        public override async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await CreateSummaryQuery().ToListAsync();
        }

        public async Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null)
        {
            pageNumber = Math.Max(1, pageNumber);
            pageSize = Math.Max(1, pageSize);

            var query = CreateSummaryQuery();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = searchTerm.Trim().ToLower();
                query = query.Where(b =>
                    (b.Title ?? string.Empty).ToLower().Contains(normalizedSearchTerm) ||
                    b.ISBN.Value.ToLower().Contains(normalizedSearchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b =>
                    b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
            }

            if (authorId.HasValue)
            {
                query = query.Where(b =>
                    b.BookAuthors.Any(ba => ba.AuthorId == authorId.Value));
            }

            if (publisherId.HasValue)
            {
                query = query.Where(b => b.PublisherId == publisherId.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(b => b.IsAvailable == isAvailable.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(b => b.Title)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Book?> GetByISBNAsync(string isbn)
        {
            return await _dbSet
                .FirstOrDefaultAsync(b => b.ISBN.Value == isbn);
        }


        public async Task<Book?> GetDetailByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories)
                    .ThenInclude(bc => bc.Category)
                .Include(b => b.Images)
                .Include(b => b.Files)
                .Include(b => b.Metadata)
                .Include(b => b.Prices)
                .Include(b => b.StockItems)
                // Tạm bỏ Include Reviews để tránh lỗi cột không hợp lệ
                // .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Book>> SearchAsync(string searchTerm, int? take = null)
        {
            var query = CreateSummaryQuery()
                .Where(b => b.Title.Contains(searchTerm) ||
                           b.Description!.Contains(searchTerm) ||
                           b.BookAuthors.Any(ba => ba.Author.Name.Contains(searchTerm)))
                .OrderBy(b => b.Title);

            return await ApplyTake(query, take).ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByCategoryAsync(Guid categoryId, int? take = null)
        {
            var query = CreateSummaryQuery()
                .Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId))
                .OrderBy(b => b.Title);

            return await ApplyTake(query, take).ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByAuthorAsync(Guid authorId, int? take = null)
        {
            var query = CreateSummaryQuery()
                .Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId))
                .OrderBy(b => b.Title);

            return await ApplyTake(query, take).ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByPublisherAsync(Guid publisherId, int? take = null)
        {
            var query = CreateSummaryQuery()
                .Where(b => b.PublisherId == publisherId)
                .OrderBy(b => b.Title);

            return await ApplyTake(query, take).ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetLatestBooksAsync(int count)
        {
            return await CreateSummaryQuery()
                .OrderByDescending(b => b.PublicationYear)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetRecommendationsAsync(
            IReadOnlyCollection<Guid> excludeBookIds,
            IReadOnlyCollection<Guid> categoryIds,
            int limit)
        {
            limit = Math.Max(1, limit);
            var excludedIds = excludeBookIds.ToList();
            var selectedIds = new HashSet<Guid>();
            var recommendations = new List<Book>();

            IQueryable<Book> BaseQuery()
            {
                var query = CreateSummaryQuery().Where(b => b.IsAvailable);

                if (excludedIds.Count > 0)
                {
                    query = query.Where(b => !excludedIds.Contains(b.Id));
                }

                if (selectedIds.Count > 0)
                {
                    var selectedIdList = selectedIds.ToList();
                    query = query.Where(b => !selectedIdList.Contains(b.Id));
                }

                return query;
            }

            if (categoryIds.Count > 0)
            {
                var categoryMatches = await BaseQuery()
                    .Where(b => b.BookCategories.Any(bc => categoryIds.Contains(bc.CategoryId)))
                    .OrderByDescending(b => b.BookCategories.Count(bc => categoryIds.Contains(bc.CategoryId)))
                    .ThenByDescending(b => b.Prices
                        .Where(p => p.IsCurrent
                                    && p.EffectiveFrom <= DateTime.UtcNow
                                    && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                        .OrderByDescending(p => p.EffectiveFrom)
                        .Select(p => (decimal?)p.Amount)
                        .FirstOrDefault() ?? 0)
                    .Take((int)(limit * 0.7))
                    .ToListAsync();

                recommendations.AddRange(categoryMatches);
                foreach (var bookId in categoryMatches.Select(b => b.Id))
                {
                    selectedIds.Add(bookId);
                }
            }

            var remainingSlots = limit - recommendations.Count;
            if (remainingSlots > 0)
            {
                var popularBooks = await BaseQuery()
                    .OrderByDescending(b => b.StockItems.Sum(s => s.QuantityOnHand))
                    .ThenByDescending(b => b.PublicationYear)
                    .Take(remainingSlots)
                    .ToListAsync();

                recommendations.AddRange(popularBooks);
                foreach (var bookId in popularBooks.Select(b => b.Id))
                {
                    selectedIds.Add(bookId);
                }
            }

            remainingSlots = limit - recommendations.Count;
            if (remainingSlots > 0)
            {
                var fillerBooks = await BaseQuery()
                    .OrderBy(_ => Guid.NewGuid())
                    .Take(remainingSlots)
                    .ToListAsync();

                recommendations.AddRange(fillerBooks);
            }

            return recommendations;
        }

        public async Task<IEnumerable<Book>> GetBestSellingBooksAsync(int count)
        {
            return await CreateSummaryQuery()
                .Where(b => b.IsAvailable)
                .OrderByDescending(b => b.StockItems.Sum(s => s.QuantityOnHand))
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetNewestBooksAsync(int count)
        {
            return await CreateSummaryQuery()
                .Where(b => b.IsAvailable)
                .OrderByDescending(b => b.PublicationYear)
                .ThenBy(b => b.Title)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetMostViewedBooksAsync(int count)
        {
            return await CreateSummaryQuery()
                .Where(b => b.IsAvailable)
                .OrderByDescending(b => b.StockItems.Sum(s => s.QuantityOnHand))
                .Take(count)
                .ToListAsync();
        }

        public async Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeId = null)
        {
            var query = _dbSet.Where(b => b.ISBN.Value == isbn);

            if (excludeId.HasValue)
            {
                query = query.Where(b => b.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        private IQueryable<Book> CreateSummaryQuery()
        {
            return _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories)
                    .ThenInclude(bc => bc.Category)
                .Include(b => b.Images)
                .Include(b => b.Prices)
                .Include(b => b.StockItems);
        }

        private static IQueryable<Book> ApplyTake(IQueryable<Book> query, int? take)
        {
            return take.HasValue ? query.Take(take.Value) : query;
        }
    }
}
