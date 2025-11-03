using BookStore.Application.Dtos.Inventory;

namespace BookStore.Application.IService.Inventory
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync();
        Task<WarehouseDto?> GetWarehouseByIdAsync(Guid id);
        Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto dto);
        Task<WarehouseDto?> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto dto);
        Task<bool> DeleteWarehouseAsync(Guid id);
    }

    public interface IPriceService
    {
        Task<PriceDto?> GetCurrentPriceByBookIdAsync(Guid bookId);
        Task<IEnumerable<PriceDto>> GetPriceHistoryByBookIdAsync(Guid bookId);
        Task<IEnumerable<PriceDto>> GetAllCurrentPricesAsync();
        Task<PriceDto> CreatePriceAsync(CreatePriceDto dto);
        Task<PriceDto?> UpdatePriceAsync(Guid bookId, UpdatePriceDto dto);
        Task BulkUpdatePricesAsync(BulkUpdatePriceDto dto);
    }

    public interface IStockItemService
    {
        Task<StockItemDto?> GetStockByBookAndWarehouseAsync(Guid bookId, Guid warehouseId);
        Task<IEnumerable<StockItemDto>> GetStocksByBookIdAsync(Guid bookId);
        Task<IEnumerable<StockItemDto>> GetStocksByWarehouseIdAsync(Guid warehouseId);
        Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync(int threshold = 10);
        Task<IEnumerable<StockItemDto>> GetOutOfStockItemsAsync();
        Task<StockItemDto> CreateStockItemAsync(CreateStockItemDto dto);
        Task<StockItemDto?> UpdateStockQuantityAsync(Guid bookId, Guid warehouseId, UpdateStockQuantityDto dto);
        Task<bool> ReserveStockAsync(ReserveStockDto dto);
        Task<bool> ReleaseReservedStockAsync(Guid bookId, Guid warehouseId, int quantity);
        Task<bool> ConfirmSaleAsync(Guid bookId, Guid warehouseId, int quantity);
    }
}
