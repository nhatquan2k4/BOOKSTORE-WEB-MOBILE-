using BookStore.Domain.Entities.Cart;
using BookStore.Domain.IRepository.Cart;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Cart
{
    public class CartItemRepository : GenericRepository<CartItem>, ICartItemRepository
    {
        public CartItemRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<CartItem>> GetItemsByCartIdAsync(Guid cartId)
        {
            return await _dbSet
                .Where(item => item.CartId == cartId)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Images)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Publisher)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookCategories)
                .OrderBy(item => item.AddedAt)
                .ToListAsync();
        }

        public async Task<CartItem?> GetItemWithBookAsync(Guid itemId)
        {
            return await _dbSet
                .Include(item => item.Book)
                    .ThenInclude(book => book.Images)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Publisher)
                .Include(item => item.Cart)
                .FirstOrDefaultAsync(item => item.Id == itemId);
        }

        public async Task<CartItem?> GetItemByCartAndBookAsync(Guid cartId, Guid bookId)
        {
            return await _dbSet
                .Include(item => item.Book)
                .FirstOrDefaultAsync(item => item.CartId == cartId && item.BookId == bookId);
        }

        public async Task<bool> IsBookInCartAsync(Guid cartId, Guid bookId)
        {
            return await _dbSet
                .AnyAsync(item => item.CartId == cartId && item.BookId == bookId);
        }

        public async Task<int> CountItemsInCartAsync(Guid cartId)
        {
            return await _dbSet
                .Where(item => item.CartId == cartId)
                .SumAsync(item => item.Quantity);
        }

        public async Task<decimal> GetCartTotalAsync(Guid cartId)
        {
            return await _dbSet
                .Where(item => item.CartId == cartId)
                .SumAsync(item => item.UnitPrice * item.Quantity);
        }

        public async Task DeleteAllItemsInCartAsync(Guid cartId)
        {
            var items = await _dbSet
                .Where(item => item.CartId == cartId)
                .ToListAsync();

            _dbSet.RemoveRange(items);
        }

        public async Task DeleteStaleItemsAsync(int daysThreshold = 30)
        {
            var thresholdDate = DateTime.UtcNow.AddDays(-daysThreshold);

            var staleItems = await _dbSet
                .Where(item => item.AddedAt < thresholdDate)
                .ToListAsync();

            _dbSet.RemoveRange(staleItems);
        }

        public async Task<IEnumerable<CartItem>> GetItemsByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(item => item.Cart.UserId == userId && item.Cart.IsActive)
                .Include(item => item.Book)
                    .ThenInclude(book => book.Images)
                .Include(item => item.Book)
                    .ThenInclude(book => book.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .Include(item => item.Cart)
                .OrderBy(item => item.AddedAt)
                .ToListAsync();
        }
    }
}