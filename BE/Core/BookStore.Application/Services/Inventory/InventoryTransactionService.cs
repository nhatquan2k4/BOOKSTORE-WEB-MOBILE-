using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Inventory
{
    public class InventoryTransactionService : IInventoryTransactionService
    {
        private readonly IInventoryTransactionRepository _repository;

        public InventoryTransactionService(IInventoryTransactionRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<InventoryTransactionDto>> GetFilteredTransactionsAsync(InventoryTransactionFilterDto filter)
        {
            // Parse transaction type if provided
            InventoryTransactionType? transactionType = null;
            if (!string.IsNullOrEmpty(filter.Type))
            {
                if (Enum.TryParse<InventoryTransactionType>(filter.Type, true, out var parsedType))
                {
                    transactionType = parsedType;
                }
                else
                {
                    throw new UserFriendlyException($"Invalid transaction type: {filter.Type}. Valid values: Inbound, Outbound, Adjustment");
                }
            }

            // Get total count
            var totalCount = await _repository.GetTotalCountAsync(
                filter.WarehouseId,
                filter.BookId,
                transactionType,
                filter.FromDate,
                filter.ToDate
            );

            // Get filtered items
            var items = await _repository.GetFilteredAsync(
                filter.WarehouseId,
                filter.BookId,
                transactionType,
                filter.FromDate,
                filter.ToDate,
                filter.PageNumber,
                filter.PageSize
            );

            var dtoItems = items.ToDtoList().ToList();

            return new PagedResult<InventoryTransactionDto>(
                dtoItems,
                totalCount,
                filter.PageNumber,
                filter.PageSize
            );
        }

        public async Task<IEnumerable<InventoryTransactionDto>> GetByWarehouseIdAsync(Guid warehouseId, int pageNumber = 1, int pageSize = 20)
        {
            var transactions = await _repository.GetByWarehouseIdAsync(warehouseId, pageNumber, pageSize);
            return transactions.ToDtoList();
        }

        public async Task<IEnumerable<InventoryTransactionDto>> GetByBookIdAsync(Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            var transactions = await _repository.GetByBookIdAsync(bookId, pageNumber, pageSize);
            return transactions.ToDtoList();
        }

        public async Task<IEnumerable<InventoryTransactionDto>> GetByWarehouseAndBookAsync(Guid warehouseId, Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            var transactions = await _repository.GetByWarehouseAndBookAsync(warehouseId, bookId, pageNumber, pageSize);
            return transactions.ToDtoList();
        }

        public async Task<InventoryTransactionDto> CreateTransactionAsync(CreateInventoryTransactionDto dto)
        {
            // Validate transaction type
            if (!Enum.TryParse<InventoryTransactionType>(dto.Type, true, out var transactionType))
            {
                throw new UserFriendlyException($"Invalid transaction type: {dto.Type}. Valid values: Inbound, Outbound, Adjustment");
            }

            // Validate quantity change based on type
            if (transactionType == InventoryTransactionType.Inbound && dto.QuantityChange < 0)
            {
                throw new UserFriendlyException("Inbound transactions must have positive quantity change");
            }
            
            if (transactionType == InventoryTransactionType.Outbound && dto.QuantityChange > 0)
            {
                throw new UserFriendlyException("Outbound transactions must have negative quantity change");
            }

            var transaction = await _repository.CreateTransactionAsync(
                dto.WarehouseId,
                dto.BookId,
                transactionType,
                dto.QuantityChange,
                dto.ReferenceId,
                dto.Note
            );

            return transaction.ToDto();
        }
    }
}
