using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Domain.IRepository.Inventory
{
    public interface IWarehouseRepository : IGenericRepository<Warehouse>
    {
        // Lấy warehouse với danh sách StockItems
        Task<Warehouse?> GetWarehouseWithStockItemsAsync(Guid warehouseId);
        
        // Lấy tất cả warehouses
        Task<IEnumerable<Warehouse>> GetAllWarehousesAsync();
        
        // Tìm warehouse theo tên
        Task<Warehouse?> GetWarehouseByNameAsync(string name);
        
        // Kiểm tra warehouse có tồn tại không
        Task<bool> WarehouseExistsAsync(Guid warehouseId);
        
        // Lấy warehouse với statistics để lấy kho + dữ liệu phục vụ thống kê (số mặt hàng, tổng số lượng…)
        Task<Warehouse?> GetWarehouseWithStatisticsAsync(Guid warehouseId);
    }
}
