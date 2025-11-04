using BookStore.Application.Dtos.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Application.Mappers.Inventory
{
    /// <summary>
    /// Mapper thủ công cho Warehouse entity
    /// </summary>
    public static class WarehouseMapper
    {
        /// <summary>
        /// Map Warehouse entity sang WarehouseDto
        /// </summary>
        public static WarehouseDto ToDto(this Warehouse warehouse)
        {
            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Address = warehouse.Address,
                Description = warehouse.Description,
                CreatedAt = warehouse.CreatedAt,
                UpdatedAt = warehouse.UpdatedAt,
                TotalStockItems = warehouse.StockItems?.Count ?? 0,
                TotalQuantity = warehouse.StockItems?.Sum(s => s.QuantityOnHand) ?? 0
            };
        }

        /// <summary>
        /// Map CreateWarehouseDto sang Warehouse entity
        /// </summary>
        public static Warehouse ToEntity(this CreateWarehouseDto dto)
        {
            return new Warehouse
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Update Warehouse entity từ UpdateWarehouseDto
        /// </summary>
        public static void UpdateFromDto(this Warehouse warehouse, UpdateWarehouseDto dto)
        {
            if (!string.IsNullOrEmpty(dto.Name))
                warehouse.Name = dto.Name;

            if (dto.Address != null)
                warehouse.Address = dto.Address;

            if (dto.Description != null)
                warehouse.Description = dto.Description;

            warehouse.UpdatedAt = DateTime.UtcNow;
        }
    }
}
