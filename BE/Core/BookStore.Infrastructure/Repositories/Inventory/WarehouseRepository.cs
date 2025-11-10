using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Inventory
{
    public class WarehouseRepository : GenericRepository<Warehouse>, IWarehouseRepository
    {
        public WarehouseRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Warehouse?> GetWarehouseWithStockItemsAsync(Guid warehouseId)
        {
            return await _dbSet
                .Include(w => w.StockItems)
                    .ThenInclude(s => s.Book)
                .FirstOrDefaultAsync(w => w.Id == warehouseId);
        }

        public async Task<IEnumerable<Warehouse>> GetAllWarehousesAsync()
        {
            return await _dbSet
                .Include(w => w.StockItems)
                .OrderBy(w => w.Name)
                .ToListAsync();
        }

        public async Task<Warehouse?> GetWarehouseByNameAsync(string name)
        {
            return await _dbSet
                .FirstOrDefaultAsync(w => w.Name.ToLower() == name.ToLower());
        }

        public async Task<bool> WarehouseExistsAsync(Guid warehouseId)
        {
            return await _dbSet.AnyAsync(w => w.Id == warehouseId);
        }

        public async Task<Warehouse?> GetWarehouseWithStatisticsAsync(Guid warehouseId)
        {
            return await _dbSet
                .Include(w => w.StockItems)
                    .ThenInclude(s => s.Book)
                .FirstOrDefaultAsync(w => w.Id == warehouseId);
        }
    }
}
