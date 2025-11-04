using BookStore.Domain.Entities.Pricing_Inventory;

namespace BookStore.Domain.IRepository.Inventory
{
    public interface IStockItemRepository : IGenericRepository<StockItem>
    {
        // Lấy tồn kho theo BookId và WarehouseId
        Task<StockItem?> GetStockByBookAndWarehouseAsync(Guid bookId, Guid warehouseId);
        
        // Lấy tất cả tồn kho của một sách (tất cả kho)
        Task<IEnumerable<StockItem>> GetStocksByBookIdAsync(Guid bookId);
        
        // Lấy tất cả tồn kho trong một kho
        Task<IEnumerable<StockItem>> GetStocksByWarehouseIdAsync(Guid warehouseId);
        
        // Lấy sách sắp hết hàng (low stock)
        Task<IEnumerable<StockItem>> GetLowStockItemsAsync(int threshold = 10);
        
        // Lấy sách hết hàng
        Task<IEnumerable<StockItem>> GetOutOfStockItemsAsync();
        
        // Tổng số lượng tồn kho của một sách (tất cả kho)
        Task<int> GetTotalStockByBookIdAsync(Guid bookId);
        
        // Tăng số lượng tồn kho
        Task IncreaseStockAsync(Guid stockItemId, int quantity);
        
        // Giảm số lượng tồn kho
        Task DecreaseStockAsync(Guid stockItemId, int quantity);
        
        // Reserve stock cho đơn hàng
        Task ReserveStockAsync(Guid bookId, Guid warehouseId, int quantity);
        
        // Release reserved stock
        Task ReleaseReservedStockAsync(Guid bookId, Guid warehouseId, int quantity);
        
        // Confirm sale (chuyển reserved sang sold)
        Task ConfirmSaleAsync(Guid bookId, Guid warehouseId, int quantity);
    }
}
