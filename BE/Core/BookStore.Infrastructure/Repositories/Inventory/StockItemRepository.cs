using BookStore.Domain.Entities.Pricing_Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Inventory
{
    public class StockItemRepository : GenericRepository<StockItem>, IStockItemRepository
    {
        public StockItemRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<StockItem?> GetStockByBookAndWarehouseAsync(Guid bookId, Guid warehouseId)
        {
            return await _dbSet
                .Include(s => s.Book)
                .FirstOrDefaultAsync(s => s.BookId == bookId && s.WarehouseId == warehouseId);
        }

        public async Task<IEnumerable<StockItem>> GetStocksByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(s => s.BookId == bookId)
                .Include(s => s.Book)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockItem>> GetStocksByWarehouseIdAsync(Guid warehouseId)
        {
            return await _dbSet
                .Where(s => s.WarehouseId == warehouseId)
                .Include(s => s.Book)
                .OrderBy(s => s.Book.Title)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockItem>> GetLowStockItemsAsync(int threshold = 10)
        {
            return await _dbSet
                .Where(s => s.QuantityOnHand <= threshold && s.QuantityOnHand > 0)
                .Include(s => s.Book)
                .OrderBy(s => s.QuantityOnHand)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockItem>> GetOutOfStockItemsAsync()
        {
            return await _dbSet
                .Where(s => s.QuantityOnHand == 0)
                .Include(s => s.Book)
                .ToListAsync();
        }

        public async Task<int> GetTotalStockByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(s => s.BookId == bookId)
                .SumAsync(s => s.QuantityOnHand);
        }

        public async Task IncreaseStockAsync(Guid stockItemId, int quantity)
        {
            var stockItem = await _dbSet.FindAsync(stockItemId);
            if (stockItem == null)
                throw new Exception($"StockItem with ID {stockItemId} not found");

            stockItem.Increase(quantity);
            await SaveChangesAsync();
        }

        public async Task DecreaseStockAsync(Guid stockItemId, int quantity)
        {
            var stockItem = await _dbSet.FindAsync(stockItemId);
            if (stockItem == null)
                throw new Exception($"StockItem with ID {stockItemId} not found");

            stockItem.Decrease(quantity);
            await SaveChangesAsync();
        }

        public async Task ReserveStockAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            var stockItem = await GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            if (stockItem == null)
                throw new Exception($"Stock not found for Book {bookId} in Warehouse {warehouseId}");

            stockItem.Reserve(quantity);
            await SaveChangesAsync();
        }

        public async Task ReleaseReservedStockAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            var stockItem = await GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            if (stockItem == null)
                throw new Exception($"Stock not found for Book {bookId} in Warehouse {warehouseId}");

            stockItem.ReleaseReserved(quantity);
            await SaveChangesAsync();
        }

        public async Task ConfirmSaleAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            var stockItem = await GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            if (stockItem == null)
                throw new Exception($"Stock not found for Book {bookId} in Warehouse {warehouseId}");

            // Release reserved quantity first
            stockItem.ReleaseReserved(quantity);
            // Then decrease stock (which increases SoldQuantity)
            stockItem.Decrease(quantity);
            await SaveChangesAsync();
        }
    }
}
