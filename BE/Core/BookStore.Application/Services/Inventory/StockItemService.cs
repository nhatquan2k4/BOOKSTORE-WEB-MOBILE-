using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;
using BookStore.Domain.IRepository.Inventory;

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
            if (stock == null) return null;

            switch (dto.Operation.ToLower())
            {
                case "increase":
                    stock.Increase(dto.Quantity);
                    break;
                case "decrease":
                    stock.Decrease(dto.Quantity);
                    break;
                case "set":
                    // Set to specific value
                    var currentQty = stock.QuantityOnHand;
                    if (dto.Quantity > currentQty)
                    {
                        stock.Increase(dto.Quantity - currentQty);
                    }
                    else if (dto.Quantity < currentQty)
                    {
                        stock.Decrease(currentQty - dto.Quantity);
                    }
                    break;
                default:
                    throw new ArgumentException("Invalid operation. Use: increase, decrease, or set");
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
