namespace BookStore.Application.Dtos.Inventory
{
    // ===== WAREHOUSE DTOs =====
    public class WarehouseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Statistics
        public int TotalStockItems { get; set; }
        public int TotalQuantity { get; set; }
    }

    public class CreateWarehouseDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateWarehouseDto
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
    }

    // ===== PRICE DTOs =====
    public class PriceDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public bool IsCurrent { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public Guid? DiscountId { get; set; }
        public string? DiscountCode { get; set; }
    }

    public class CreatePriceDto
    {
        public Guid BookId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public DateTime? EffectiveFrom { get; set; }
        public Guid? DiscountId { get; set; }
    }

    public class UpdatePriceDto
    {
        public decimal Amount { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public Guid? DiscountId { get; set; }
    }

    public class BulkUpdatePriceDto
    {
        public List<PriceUpdateItem> Prices { get; set; } = new();
    }

    public class PriceUpdateItem
    {
        public Guid BookId { get; set; }
        public decimal NewAmount { get; set; }
    }

    // ===== STOCK ITEM DTOs =====
    public class StockItemDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public int QuantityOnHand { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity => QuantityOnHand - ReservedQuantity;
        public int SoldQuantity { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class CreateStockItemDto
    {
        public Guid BookId { get; set; }
        public Guid WarehouseId { get; set; }
        public int InitialQuantity { get; set; }
    }

    public class UpdateStockQuantityDto
    {
        public int Quantity { get; set; }
        public string Operation { get; set; } = "increase"; // increase, decrease, set
        public string? Reason { get; set; }
    }

    public class ReserveStockDto
    {
        public Guid BookId { get; set; }
        public Guid WarehouseId { get; set; }
        public int Quantity { get; set; }
        public string? OrderId { get; set; }
    }

    public class StockTransferDto
    {
        public Guid BookId { get; set; }
        public Guid FromWarehouseId { get; set; }
        public Guid ToWarehouseId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }

    // ===== INVENTORY TRANSACTION DTOs =====
    public class InventoryTransactionDto
    {
        public Guid Id { get; set; }
        public Guid WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookISBN { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Inbound, Outbound, Adjustment
        public int QuantityChange { get; set; }
        public string? ReferenceId { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateInventoryTransactionDto
    {
        public Guid WarehouseId { get; set; }
        public Guid BookId { get; set; }
        public string Type { get; set; } = string.Empty; // Inbound, Outbound, Adjustment
        public int QuantityChange { get; set; }
        public string? ReferenceId { get; set; }
        public string? Note { get; set; }
    }

    public class InventoryTransactionFilterDto
    {
        public Guid? WarehouseId { get; set; }
        public Guid? BookId { get; set; }
        public string? Type { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
