using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class PriceSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Prices.AnyAsync())
                return;

            var books = await context.Books.ToListAsync();
            if (!books.Any())
            {
                throw new InvalidOperationException("Books must be seeded before Prices.");
            }

            var prices = new List<Price>();
            var random = new Random();

            foreach (var book in books)
            {
                // Tạo giá dựa trên độ phổ biến (rating và số lượng review)
                decimal basePrice = 50000m; // Giá cơ bản
                
                // Sách có rating cao và nhiều review thì giá cao hơn
                if (book.AverageRating >= 4.8m)
                    basePrice = 120000m + (random.Next(0, 50000));
                else if (book.AverageRating >= 4.5m)
                    basePrice = 90000m + (random.Next(0, 40000));
                else
                    basePrice = 60000m + (random.Next(0, 30000));

                // Làm tròn đến nghìn
                basePrice = Math.Round(basePrice / 1000) * 1000;

                prices.Add(new Price
                {
                    Id = Guid.NewGuid(),
                    BookId = book.Id,
                    Amount = basePrice,
                    Currency = "VND",
                    IsCurrent = true,
                    EffectiveFrom = DateTime.UtcNow.AddDays(-30), // Bắt đầu từ 30 ngày trước
                    EffectiveTo = null // Không có ngày kết thúc (còn hiệu lực)
                });
            }

            await context.Prices.AddRangeAsync(prices);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {prices.Count} prices for books!");
        }
    }
}
