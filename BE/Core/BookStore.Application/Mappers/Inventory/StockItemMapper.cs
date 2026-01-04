using BookStore.Application.Dtos.Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;

namespace BookStore.Application.Mappers.Inventory
{

    public static class StockItemMapper
    {

        public static StockItemDto ToDto(this StockItem stock)
        {
            return new StockItemDto
            {
                Id = stock.Id,
                BookId = stock.BookId,
                BookTitle = stock.Book?.Title ?? "",
                BookISBN = stock.Book?.ISBN?.Value ?? "",
                WarehouseId = stock.WarehouseId,
                WarehouseName = "", // Sẽ được populate bởi service nếu cần
                QuantityOnHand = stock.QuantityOnHand,
                ReservedQuantity = stock.ReservedQuantity,
                SoldQuantity = stock.SoldQuantity,
                LastUpdated = stock.LastUpdated
            };
        }

        public static StockItem ToEntity(this CreateStockItemDto dto)
        {
            var stockItem = new StockItem();

            // Set public properties using reflection
            var idProp = typeof(StockItem).GetProperty("Id");
            idProp?.SetValue(stockItem, Guid.NewGuid());

            var bookIdProp = typeof(StockItem).GetProperty("BookId");
            bookIdProp?.SetValue(stockItem, dto.BookId);

            var warehouseIdProp = typeof(StockItem).GetProperty("WarehouseId");
            warehouseIdProp?.SetValue(stockItem, dto.WarehouseId);

            // Use Increase method to set initial quantity (respects domain logic)
            if (dto.InitialQuantity > 0)
            {
                stockItem.Increase(dto.InitialQuantity);
            }

            return stockItem;
        }
    }
}
