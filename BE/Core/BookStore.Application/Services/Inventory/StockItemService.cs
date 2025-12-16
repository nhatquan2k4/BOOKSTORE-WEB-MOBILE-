using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Inventory
{
    public class StockItemService : IStockItemService
    {
        private readonly IStockItemRepository _stockItemRepository;
        private readonly IInventoryTransactionRepository _transactionRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IWarehouseRepository _warehouseRepository;

        public StockItemService(
            IStockItemRepository stockItemRepository,
            IInventoryTransactionRepository transactionRepository,
            IBookRepository bookRepository,
            IWarehouseRepository warehouseRepository)
        {
            _stockItemRepository = stockItemRepository;
            _transactionRepository = transactionRepository;
            _bookRepository = bookRepository;
            _warehouseRepository = warehouseRepository;
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
            // Validate Book exists
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            Guard.Against(book == null, $"Book with ID {dto.BookId} does not exist");

            // Validate Warehouse exists
            var warehouse = await _warehouseRepository.GetByIdAsync(dto.WarehouseId);
            Guard.Against(warehouse == null, $"Warehouse with ID {dto.WarehouseId} does not exist");

            // Check if stock item already exists
            var existing = await _stockItemRepository.GetStockByBookAndWarehouseAsync(dto.BookId, dto.WarehouseId);
            if (existing != null)
            {
                // Update existing
                existing.Increase(dto.InitialQuantity);
                await _stockItemRepository.SaveChangesAsync();

                // Log transaction
                await _transactionRepository.CreateTransactionAsync(
                    dto.WarehouseId,
                    dto.BookId,
                    InventoryTransactionType.Inbound,
                    dto.InitialQuantity,
                    null,
                    "Initial stock added to existing item"
                );

                return existing.ToDto();
            }

            // Create new stock item using mapper
            var stockItem = dto.ToEntity();
            stockItem.Increase(dto.InitialQuantity);

            await _stockItemRepository.AddAsync(stockItem);
            await _stockItemRepository.SaveChangesAsync();

            // Log transaction
            await _transactionRepository.CreateTransactionAsync(
                dto.WarehouseId,
                dto.BookId,
                InventoryTransactionType.Inbound,
                dto.InitialQuantity,
                null,
                "Initial stock creation"
            );

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

            int quantityChange = 0;
            InventoryTransactionType transactionType = InventoryTransactionType.Adjustment;

            switch (dto.Operation.ToLower())
            {
                case "increase":
                    // Use AdjustQuantity for manual increases (doesn't affect SoldQuantity)
                    stock!.AdjustQuantity(dto.Quantity);
                    quantityChange = dto.Quantity;
                    transactionType = InventoryTransactionType.Adjustment;
                    break;
                case "decrease":
                    // Use AdjustQuantity for manual decreases (doesn't affect SoldQuantity)
                    stock!.AdjustQuantity(-dto.Quantity);
                    quantityChange = -dto.Quantity;
                    transactionType = InventoryTransactionType.Adjustment;
                    break;
                case "set":
                    // Set to specific value using AdjustQuantity
                    var currentQty = stock!.QuantityOnHand;
                    var difference = dto.Quantity - currentQty;
                    if (difference != 0)
                    {
                        stock.AdjustQuantity(difference);
                        quantityChange = difference;
                        transactionType = InventoryTransactionType.Adjustment;
                    }
                    break;
                default:
                    throw new UserFriendlyException("Invalid operation");
            }

            await _stockItemRepository.SaveChangesAsync();

            // Log transaction
            if (quantityChange != 0)
            {
                await _transactionRepository.CreateTransactionAsync(
                    warehouseId,
                    bookId,
                    transactionType,
                    quantityChange,
                    null,
                    dto.Reason ?? $"Manual {dto.Operation} operation"
                );
            }

            var updated = await _stockItemRepository.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            return updated!.ToDto();
        }

        public async Task<bool> ReserveStockAsync(ReserveStockDto dto)
        {
            await _stockItemRepository.ReserveStockAsync(dto.BookId, dto.WarehouseId, dto.Quantity);

            // Log transaction for reservation (no actual quantity change yet)
            await _transactionRepository.CreateTransactionAsync(
                dto.WarehouseId,
                dto.BookId,
                InventoryTransactionType.Outbound,
                0, // Reserved, not removed yet
                dto.OrderId,
                $"Reserved {dto.Quantity} items for order"
            );

            return true;
        }

        public async Task<bool> ReleaseReservedStockAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            await _stockItemRepository.ReleaseReservedStockAsync(bookId, warehouseId, quantity);

            // Log transaction for released reservation
            await _transactionRepository.CreateTransactionAsync(
                warehouseId,
                bookId,
                InventoryTransactionType.Adjustment,
                0, // Just releasing reservation
                null,
                $"Released {quantity} reserved items"
            );

            return true;
        }

        public async Task<bool> ConfirmSaleAsync(Guid bookId, Guid warehouseId, int quantity)
        {
            var stock = await _stockItemRepository.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            Guard.Against(stock == null, "Stock item not found");
            
            Guard.Against(stock!.ReservedQuantity < quantity, 
                $"Insufficient reserved quantity. Reserved: {stock.ReservedQuantity}, Requested: {quantity}");

            // Use ConfirmSale method instead of Decrease
            stock.ConfirmSale(quantity);
            await _stockItemRepository.SaveChangesAsync();

            // Log transaction for confirmed sale
            await _transactionRepository.CreateTransactionAsync(
                warehouseId,
                bookId,
                InventoryTransactionType.Outbound,
                -quantity, // Actual outbound
                null,
                $"Confirmed sale of {quantity} items (from reserved stock)"
            );

            return true;
        }
    }
}
