using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.IRepository.Cart;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Cart
{
    public class CartRepository : GenericRepository<Domain.Entities.Ordering.Cart>, ICartRepository
    {
        public CartRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Domain.Entities.Ordering.Cart?> GetActiveCartByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.Images)
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.Publisher)
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);
        }

        public async Task<Domain.Entities.Ordering.Cart?> GetCartWithItemsAsync(Guid cartId)
        {
            return await _dbSet
                .Include(c => c.Items).ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(c => c.Id == cartId);
        }

        public async Task<Domain.Entities.Ordering.Cart> GetOrCreateCartAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            
            if (cart == null)
            {
                cart = new Domain.Entities.Ordering.Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await AddAsync(cart);
                await SaveChangesAsync();
            }

            return cart;
        }

        public async Task AddOrUpdateItemAsync(Guid userId, Guid bookId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);
            
            var existingItem = cart.Items.FirstOrDefault(i => i.BookId == bookId);
            
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                // Note: CartItem entity doesn't have UpdatedAt field in domain model
            }
            else
            {
                // Need to get current price from Book
                var book = await _context.Set<Domain.Entities.Catalog.Book>()
                    .Include(b => b.Prices)
                    .FirstOrDefaultAsync(b => b.Id == bookId);
                
                var currentPrice = book?.Prices?
                    .Where(p => p.IsCurrent && (!p.EffectiveTo.HasValue || p.EffectiveTo.Value > DateTime.UtcNow))
                    .OrderByDescending(p => p.EffectiveFrom)
                    .FirstOrDefault()?.Amount ?? 0;

                cart.Items.Add(new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    BookId = bookId,
                    Quantity = quantity,
                    UnitPrice = currentPrice,
                    AddedAt = DateTime.UtcNow
                });
            }

            Update(cart);
        }

        public async Task RemoveItemAsync(Guid userId, Guid bookId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            var item = cart.Items.FirstOrDefault(i => i.BookId == bookId);
            if (item != null)
            {
                cart.Items.Remove(item);
                Update(cart);
            }
        }

        public async Task UpdateItemQuantityAsync(Guid userId, Guid bookId, int quantity)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            var item = cart.Items.FirstOrDefault(i => i.BookId == bookId);
            if (item != null)
            {
                if (quantity <= 0)
                {
                    cart.Items.Remove(item);
                }
                else
                {
                    item.Quantity = quantity;
                    // Note: CartItem entity doesn't have UpdatedAt field in domain model
                }
                Update(cart);
            }
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            cart.Items.Clear();
            Update(cart);
        }

        public async Task DeactivateCartAsync(Guid cartId)
        {
            var cart = await GetByIdAsync(cartId);
            if (cart == null) return;

            cart.IsActive = false;
            Update(cart);
        }

        public async Task<int> GetCartItemCountAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            return cart?.Items.Sum(i => i.Quantity) ?? 0;
        }

        public async Task<decimal> GetCartTotalAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return 0;

            return cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        }
    }
}