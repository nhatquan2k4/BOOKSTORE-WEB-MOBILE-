using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Catalog
{
    public class WishlistRepository : GenericRepository<Wishlist>, IWishlistRepository
    {
        public WishlistRepository(AppDbContext context) : base(context) { }

        public async Task<List<Wishlist>> GetWishlistByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(w => w.UserId == userId)
                .Include(w => w.Book)
                    .ThenInclude(b => b.Images)
                .Include(w => w.Book)
                    .ThenInclude(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(w => w.Book)
                    .ThenInclude(b => b.Publisher)
                .Include(w => w.Book)
                    .ThenInclude(b => b.Prices)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsBookInWishlistAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .AnyAsync(w => w.UserId == userId && w.BookId == bookId);
        }

        public async Task<Wishlist?> GetWishlistItemAsync(Guid userId, Guid bookId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
        }

        public async Task<Wishlist> AddToWishlistAsync(Guid userId, Guid bookId)
        {
            // Kiểm tra xem đã tồn tại chưa
            var existing = await GetWishlistItemAsync(userId, bookId);
            if (existing != null)
                return existing;

            var wishlistItem = new Wishlist
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };

            await AddAsync(wishlistItem);
            await SaveChangesAsync();

            return wishlistItem;
        }

        public async Task<bool> RemoveFromWishlistAsync(Guid userId, Guid bookId)
        {
            var item = await GetWishlistItemAsync(userId, bookId);
            if (item == null)
                return false;

            Delete(item);
            await SaveChangesAsync();
            return true;
        }

        public async Task<int> GetWishlistCountAsync(Guid userId)
        {
            return await _dbSet
                .Where(w => w.UserId == userId)
                .CountAsync();
        }

        public async Task ClearWishlistAsync(Guid userId)
        {
            var items = await _dbSet
                .Where(w => w.UserId == userId)
                .ToListAsync();

            if (items.Any())
            {
                _dbSet.RemoveRange(items);
                await SaveChangesAsync();
            }
        }

        public async Task<List<Guid>> GetWishlistBookIdsAsync(Guid userId)
        {
            return await _dbSet
                .Where(w => w.UserId == userId)
                .Select(w => w.BookId)
                .ToListAsync();
        }
    }
}
