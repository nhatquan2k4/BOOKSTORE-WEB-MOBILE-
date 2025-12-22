using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class WarehouseSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Warehouses.AnyAsync())
                return;

            var warehouses = new[]
            {
                new Warehouse
                {
                    Id = Guid.Parse("d1925db2-8fa2-4471-ae9d-acb6cf133a73"), 
                    Name = "Kho Hà Nội",
                    Address = "Số 123, Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội",
                    Description = "Kho trung tâm khu vực miền Bắc",
                    IsActive = true,
                    Priority = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Name = "Kho TP. Hồ Chí Minh",
                    Address = "Số 456, Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
                    Description = "Kho trung tâm khu vực miền Nam",
                    IsActive = true,
                    Priority = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Name = "Kho Đà Nẵng",
                    Address = "Số 789, Đường Nguyễn Tất Thành, Quận Liên Chiểu, Đà Nẵng",
                    Description = "Kho trung tâm khu vực miền Trung",
                    IsActive = true,
                    Priority = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Name = "Kho Cần Thơ",
                    Address = "Số 321, Đường 30 Tháng 4, Quận Ninh Kiều, Cần Thơ",
                    Description = "Kho khu vực Đồng bằng sông Cửu Long",
                    IsActive = true,
                    Priority = 3,
                    CreatedAt = DateTime.UtcNow
                },
                new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Name = "Kho Hải Phòng",
                    Address = "Số 567, Đường Lê Hồng Phong, Quận Ngô Quyền, Hải Phòng",
                    Description = "Kho khu vực cảng biển miền Bắc",
                    IsActive = true,
                    Priority = 3,
                    CreatedAt = DateTime.UtcNow
                },
                new Warehouse
                {
                    Id = Guid.NewGuid(),
                    Name = "Kho Nha Trang",
                    Address = "Số 234, Đường Trần Phú, TP. Nha Trang, Khánh Hòa",
                    Description = "Kho khu vực duyên hải Nam Trung Bộ",
                    IsActive = false,
                    Priority = 4,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Warehouses.AddRangeAsync(warehouses);
            await context.SaveChangesAsync();
        }
    }
}
