using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Ordering
{
    public class OrderItemRepository : GenericRepository<OrderItem>, IOrderItemRepository
    {
        public OrderItemRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<OrderItem>> GetItemsByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Where(item => item.OrderId == orderId)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Images)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Publisher)
                .ToListAsync();
        }

        public async Task<OrderItem?> GetItemWithBookAsync(Guid itemId)
        {
            return await _dbSet
                .Include(item => item.Book)
                    .ThenInclude(book => book.Images)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Publisher)
                .Include(item => item.Order)
                .FirstOrDefaultAsync(item => item.Id == itemId);
        }

        public async Task<IEnumerable<OrderItem>> GetItemsByBookIdAsync(Guid bookId, int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(item => item.BookId == bookId)
                .Include(item => item.Order)
                    .ThenInclude(order => order.User)
                .OrderByDescending(item => item.Order.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<int> GetTotalQuantitySoldAsync(Guid bookId)
        {
            return await _dbSet
                .Where(item => item.BookId == bookId 
                    && (item.Order.Status == "Completed" || item.Order.Status == "Paid"))
                .SumAsync(item => item.Quantity);
        }

        public async Task<IEnumerable<(Guid BookId, int TotalQuantity)>> GetTopSellingBooksAsync(
            int count = 10, 
            DateTime? fromDate = null, 
            DateTime? toDate = null)
        {
            var query = _dbSet
                .Include(item => item.Order)
                .Where(item => item.Order.Status == "Completed" || item.Order.Status == "Paid");

            if (fromDate.HasValue)
            {
                query = query.Where(item => item.Order.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(item => item.Order.CreatedAt <= toDate.Value);
            }

            return await query
                .GroupBy(item => item.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    TotalQuantity = g.Sum(item => item.Quantity)
                })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Select(x => ValueTuple.Create(x.BookId, x.TotalQuantity))
                .ToListAsync();
        }

        public async Task<decimal> GetRevenueByBookAsync(Guid bookId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _dbSet
                .Include(item => item.Order)
                .Where(item => item.BookId == bookId 
                    && (item.Order.Status == "Completed" || item.Order.Status == "Paid"));

            if (fromDate.HasValue)
            {
                query = query.Where(item => item.Order.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(item => item.Order.CreatedAt <= toDate.Value);
            }

            return await query.SumAsync(item => item.Subtotal);
        }

        public async Task<bool> HasUserPurchasedBookAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .AnyAsync(item => item.BookId == bookId 
                    && item.Order.UserId == userId
                    && (item.Order.Status == "Completed" || item.Order.Status == "Paid"));
        }
    }
}