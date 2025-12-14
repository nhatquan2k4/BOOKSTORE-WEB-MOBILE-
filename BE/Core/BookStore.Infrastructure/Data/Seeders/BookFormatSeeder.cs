using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class BookFormatSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.BookFormats.AnyAsync())
                return;

            var formats = new[]
            {
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Bìa mềm",
                    Description = "Sách bìa mềm (Paperback) - Dạng sách phổ biến nhất, nhẹ và dễ mang theo"
                },
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Bìa cứng",
                    Description = "Sách bìa cứng (Hardcover) - Sách cao cấp với bìa cứng, bền bỉ và sang trọng"
                },
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Ebook",
                    Description = "Sách điện tử (Ebook) - Định dạng số, đọc trên thiết bị điện tử"
                },
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Audiobook",
                    Description = "Sách nói (Audiobook) - Nghe sách qua file âm thanh"
                },
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Bìa da",
                    Description = "Sách bìa da cao cấp - Thường dùng cho sách sưu tầm hoặc quà tặng"
                },
                new BookFormat
                {
                    Id = Guid.NewGuid(),
                    FormatType = "Pocket",
                    Description = "Sách bỏ túi - Kích thước nhỏ gọn, tiện lợi mang theo"
                }
            };

            await context.BookFormats.AddRangeAsync(formats);
            await context.SaveChangesAsync();
        }
    }
}
