using BookStore.Domain.Entities.Pricing_Inventory;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class StockItemSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.StockItems.AnyAsync())
                return;

            var books = await context.Books.ToListAsync();
            var warehouses = await context.Warehouses.ToListAsync();

            if (!books.Any())
            {
                throw new InvalidOperationException("Books must be seeded before StockItems.");
            }

            if (!warehouses.Any())
            {
                throw new InvalidOperationException("Warehouses must be seeded before StockItems.");
            }

            // Lấy kho chính (kho đầu tiên)
            var mainWarehouse = warehouses.First();

            var stockItems = new List<StockItem>();
            var random = new Random();

            foreach (var book in books)
            {
                // Tạo số lượng tồn kho ngẫu nhiên dựa trên độ phổ biến
                int stockQuantity;
                
                if (book.AverageRating >= 4.8m && book.TotalReviews > 3000)
                {
                    // Sách rất phổ biến - tồn kho nhiều
                    stockQuantity = random.Next(200, 500);
                }
                else if (book.AverageRating >= 4.5m && book.TotalReviews > 1000)
                {
                    // Sách phổ biến - tồn kho trung bình
                    stockQuantity = random.Next(100, 300);
                }
                else
                {
                    // Sách ít phổ biến hơn - tồn kho thấp
                    stockQuantity = random.Next(50, 150);
                }

                var stockItem = new StockItem
                {
                    Id = Guid.NewGuid(),
                    BookId = book.Id,
                    WarehouseId = mainWarehouse.Id
                };

                // Sử dụng reflection để set private properties cho seeding
                typeof(StockItem).GetProperty("QuantityOnHand")?.SetValue(stockItem, stockQuantity);
                typeof(StockItem).GetProperty("ReservedQuantity")?.SetValue(stockItem, 0);
                typeof(StockItem).GetProperty("SoldQuantity")?.SetValue(stockItem, random.Next(50, 200));
                typeof(StockItem).GetProperty("LastUpdated")?.SetValue(stockItem, DateTime.UtcNow);

                stockItems.Add(stockItem);
            }

            await context.StockItems.AddRangeAsync(stockItems);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {stockItems.Count} stock items for books!");
        }
    }
}
