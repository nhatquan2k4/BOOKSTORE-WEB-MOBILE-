using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Cart;
using BookStore.Domain.IRepository.Cart;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Cart
{
    public class CartRepository : GenericRepository<Domain.Entities.Cart.Cart>, ICartRepository
    {
        public CartRepository(AppDbContext context) : base(context) { }

        public async Task<Domain.Entities.Cart.Cart?> GetActiveCartByUserIdAsync(Guid userId)
        {
            // Truy vấn có tracking để EF theo dõi thay đổi
            return await _dbSet
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.Images)
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.Publisher)
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                // Ensure StockItems are loaded so StockQuantity can be calculated
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.StockItems)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);
        }

        public async Task<Domain.Entities.Cart.Cart?> GetCartWithItemsAsync(Guid cartId)
        {
            return await _dbSet
                .Include(c => c.Items).ThenInclude(i => i.Book)
                // Include StockItems for book so quantity available can be calculated
                .Include(c => c.Items).ThenInclude(i => i.Book).ThenInclude(b => b.StockItems)
                .FirstOrDefaultAsync(c => c.Id == cartId);
        }

        public async Task<Domain.Entities.Cart.Cart> GetOrCreateCartAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart != null) return cart;

            cart = new Domain.Entities.Cart.Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Items = new List<CartItem>()
            };

            await AddAsync(cart);
            await SaveChangesAsync();

            // Reload cart với tracking để đảm bảo có thể thêm items
            return await GetActiveCartByUserIdAsync(userId) ?? cart;
        }

        public async Task AddOrUpdateItemAsync(Guid userId, Guid bookId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);

            // tìm item theo BookId trong cart đang track
            var existingItem = cart.Items.FirstOrDefault(i => i.BookId == bookId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
                return; // SaveChanges ở Service
            }

            // Lấy giá hiện tại của sách
            var book = await _context.Set<Book>()
                .Include(b => b.Prices)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null)
                throw new InvalidOperationException($"Sách với ID {bookId} không tồn tại");

            var currentPrice = book.Prices?
                .Where(p => p.IsCurrent && (!p.EffectiveTo.HasValue || p.EffectiveTo.Value > DateTime.UtcNow))
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefault()?.Amount ?? 0m;

            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                BookId = bookId,
                Quantity = quantity,
                UnitPrice = currentPrice,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add vào context thay vì collection để đảm bảo tracking
            await _context.Set<CartItem>().AddAsync(newItem);
        }

        public async Task RemoveItemAsync(Guid userId, Guid bookId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            var item = cart.Items.FirstOrDefault(i => i.BookId == bookId);
            if (item != null)
            {
                _context.Remove(item); // xoá trực tiếp
            }
        }

        public async Task UpdateItemQuantityAsync(Guid userId, Guid bookId, int quantity)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            var item = cart.Items.FirstOrDefault(i => i.BookId == bookId);
            if (item == null) return;

            if (quantity <= 0)
            {
                _context.Remove(item);
            }
            else
            {
                item.Quantity = quantity;
                item.UpdatedAt = DateTime.UtcNow;
            }
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return;

            if (cart.Items.Count > 0)
            {
                _context.RemoveRange(cart.Items); // xoá tất cả item
            }
        }

        public async Task DeactivateCartAsync(Guid cartId)
        {
            var cart = await GetByIdAsync(cartId);
            if (cart == null) return;

            cart.IsActive = false; // chỉ set flag; EF sẽ tạo UPDATE phù hợp
        }

        public async Task<int> GetCartItemCountAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            return cart?.Items.Sum(i => i.Quantity) ?? 0;
        }

        public async Task<decimal> GetCartTotalAsync(Guid userId)
        {
            var cart = await GetActiveCartByUserIdAsync(userId);
            if (cart == null) return 0m;

            return cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        }
    }
}