using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Inventory
{
    public class InventoryTransactionRepository : GenericRepository<InventoryTransaction>, IInventoryTransactionRepository
    {
        public InventoryTransactionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<InventoryTransaction>> GetByWarehouseIdAsync(Guid warehouseId, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(t => t.WarehouseId == warehouseId)
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryTransaction>> GetByBookIdAsync(Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(t => t.BookId == bookId)
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryTransaction>> GetByWarehouseAndBookAsync(Guid warehouseId, Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(t => t.WarehouseId == warehouseId && t.BookId == bookId)
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryTransaction>> GetByTypeAsync(InventoryTransactionType type, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(t => t.Type == type)
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryTransaction>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbSet
                .Where(t => t.CreatedAt >= fromDate && t.CreatedAt <= toDate)
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryTransaction>> GetFilteredAsync(
            Guid? warehouseId = null,
            Guid? bookId = null,
            InventoryTransactionType? type = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            int pageNumber = 1,
            int pageSize = 20)
        {
            var query = _dbSet.AsQueryable();

            if (warehouseId.HasValue)
                query = query.Where(t => t.WarehouseId == warehouseId.Value);

            if (bookId.HasValue)
                query = query.Where(t => t.BookId == bookId.Value);

            if (type.HasValue)
                query = query.Where(t => t.Type == type.Value);

            if (fromDate.HasValue)
                query = query.Where(t => t.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(t => t.CreatedAt <= toDate.Value);

            return await query
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync(
            Guid? warehouseId = null,
            Guid? bookId = null,
            InventoryTransactionType? type = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var query = _dbSet.AsQueryable();

            if (warehouseId.HasValue)
                query = query.Where(t => t.WarehouseId == warehouseId.Value);

            if (bookId.HasValue)
                query = query.Where(t => t.BookId == bookId.Value);

            if (type.HasValue)
                query = query.Where(t => t.Type == type.Value);

            if (fromDate.HasValue)
                query = query.Where(t => t.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(t => t.CreatedAt <= toDate.Value);

            return await query.CountAsync();
        }

        public async Task<InventoryTransaction> CreateTransactionAsync(
            Guid warehouseId,
            Guid bookId,
            InventoryTransactionType type,
            int quantityChange,
            string? referenceId = null,
            string? note = null)
        {
            var transaction = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                WarehouseId = warehouseId,
                BookId = bookId,
                Type = type,
                QuantityChange = quantityChange,
                ReferenceId = referenceId,
                Note = note,
                CreatedAt = DateTime.UtcNow
            };

            await _dbSet.AddAsync(transaction);
            await _context.SaveChangesAsync();

            return await _dbSet
                .Include(t => t.Book)
                .Include(t => t.Warehouse)
                .FirstAsync(t => t.Id == transaction.Id);
        }
    }
}
