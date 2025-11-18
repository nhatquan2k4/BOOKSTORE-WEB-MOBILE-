using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Inventory
{
    public class StockItemService : IStockItemService
    {
        private readonly IStockItemRepository _stockItemRepository;

        public StockItemService(IStockItemRepository stockItemRepository)
        {
            _stockItemRepository = stockItemRepository;
        }

        public async Task<StockItemDto?> GetStockByBookAndWarehouseAsync(Guid bookId, Guid warehouseId)
        {
            var stock = await _stockItemRepository.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            return stock?.ToDto();
        }

        public async Task<IEnumerable<StockItemDto>> GetStocksByBookIdAsync(Guid bookId)
        {
            var stocks = await _stockItemRepository.GetStocksByBookIdAsync(bookId);
            return stocks.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<StockItemDto>> GetStocksByWarehouseIdAsync(Guid warehouseId)
        {
            var stocks = await _stockItemRepository.GetStocksByWarehouseIdAsync(warehouseId);
            return stocks.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<StockItemDto>> GetLowStockItemsAsync(int threshold = 10)
        {
            var stocks = await _stockItemRepository.GetLowStockItemsAsync(threshold);
            return stocks.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<StockItemDto>> GetOutOfStockItemsAsync()
        {
            var stocks = await _stockItemRepository.GetOutOfStockItemsAsync();
            return stocks.Select(s => s.ToDto());
        }

        public async Task<StockItemDto> CreateStockItemAsync(CreateStockItemDto dto)
        {
            // Check if stock item already exists
            var existing = await _stockItemRepository.GetStockByBookAndWarehouseAsync(dto.BookId, dto.WarehouseId);
            if (existing != null)
            {
                // Update existing
                existing.Increase(dto.InitialQuantity);
                await _stockItemRepository.SaveChangesAsync();
                return existing.ToDto();
            }

            // Create new stock item using mapper
            var stockItem = dto.ToEntity();
            stockItem.Increase(dto.InitialQuantity);

            await _stockItemRepository.AddAsync(stockItem);
            await _stockItemRepository.SaveChangesAsync();

            var created = await _stockItemRepository.GetStockByBookAndWarehouseAsync(dto.BookId, dto.WarehouseId);
            return created!.ToDto();
        }

        public async Task<StockItemDto?> UpdateStockQuantityAsync(Guid bookId, Guid warehouseId, UpdateStockQuantityDto dto)
        {
            var stock = await _stockItemRepository.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            Guard.Against(stock == null, "Stock item not found");

            var validOperations = new[] { "increase", "decrease", "set" };
            Guard.Against(!validOperations.Contains(dto.Operation.ToLower()),
                "Invalid operation. Use: increase, decrease, or set");

            switch (dto.Operation.ToLower())
            {
                case "increase":
                    // Use AdjustQuantity for manual increases (doesn't affect SoldQuantity)
                    stock!.AdjustQuantity(dto.Quantity);
                    break;
                case "decrease":
                    // Use AdjustQuantity for manual decreases (doesn't affect SoldQuantity)
                    stock!.AdjustQuantity(-dto.Quantity);
                    break;
                case "set":
                    // Set to specific value using AdjustQuantity
                    var currentQty = stock!.QuantityOnHand;
                    var difference = dto.Quantity - currentQty;
                    if (difference != 0)
                    {
                        stock.AdjustQuantity(difference);
                    }
                    break;
            }

            await _stockItemRepository.SaveChangesAsync();

            var updated = await _stockItemRepository.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            return updated!.ToDto();
        }

        public async Task<bool> ReserveStockAsync(ReserveStockDto dto)
        {
            await _stockItemRepository.ReserveStockAsync(dto.BookId, dto.WarehouseId, dto.Quantity);
            return true;
        }

        public async Task<bool> ReleaseReservedStockAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            await _stockItemRepository.ReleaseReservedStockAsync(bookId, warehouseId, quantity);
            return true;
        }

        public async Task<bool> ConfirmSaleAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            await _stockItemRepository.ConfirmSaleAsync(bookId, warehouseId, quantity);
            return true;
        }
    }
}
