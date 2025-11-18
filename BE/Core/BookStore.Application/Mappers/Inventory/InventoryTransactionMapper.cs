using BookStore.Application.Dtos.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Application.Mappers.Inventory
{
    public static class InventoryTransactionMapper
    {
        public static InventoryTransactionDto ToDto(this InventoryTransaction entity)
        {
            return new InventoryTransactionDto
            {
                Id = entity.Id,
                WarehouseId = entity.WarehouseId,
                WarehouseName = entity.Warehouse?.Name ?? string.Empty,
                BookId = entity.BookId,
                BookTitle = entity.Book?.Title ?? string.Empty,
                BookISBN = entity.Book?.ISBN ?? string.Empty,
                Type = entity.Type.ToString(),
                QuantityChange = entity.QuantityChange,
                ReferenceId = entity.ReferenceId,
                Note = entity.Note,
                CreatedAt = entity.CreatedAt
            };
        }

        public static InventoryTransaction ToEntity(this CreateInventoryTransactionDto dto)
        {
            // Parse Type string to enum
            if (!Enum.TryParse<InventoryTransactionType>(dto.Type, true, out var transactionType))
            {
                throw new ArgumentException($"Invalid transaction type: {dto.Type}");
            }

            return new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                WarehouseId = dto.WarehouseId,
                BookId = dto.BookId,
                Type = transactionType,
                QuantityChange = dto.QuantityChange,
                ReferenceId = dto.ReferenceId,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static IEnumerable<InventoryTransactionDto> ToDtoList(this IEnumerable<InventoryTransaction> entities)
        {
            return entities.Select(e => e.ToDto());
        }
    }
}
