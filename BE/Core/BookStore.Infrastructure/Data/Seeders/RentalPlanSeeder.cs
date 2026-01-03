using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class RentalPlanSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.RentalPlans.AnyAsync())
                return;

            var rentalPlans = new[]
            {
                // Gói thuê đơn lẻ (SingleBook) - Giá tính 10% đến 60% giá sách tùy thời gian
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 3 ngày",
                    Description = "Thuê sách trong 3 ngày - 10% giá sách",
                    Price = 10000m, // Placeholder - Giá thực tế = 10% giá sách
                    DurationDays = 3,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 7 ngày",
                    Description = "Thuê sách trong 7 ngày - 15% giá sách",
                    Price = 15000m, // Placeholder - Giá thực tế = 15% giá sách
                    DurationDays = 7,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 14 ngày",
                    Description = "Thuê sách trong 14 ngày - 25% giá sách",
                    Price = 25000m, // Placeholder - Giá thực tế = 25% giá sách
                    DurationDays = 14,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 30 ngày",
                    Description = "Thuê sách trong 30 ngày - 40% giá sách",
                    Price = 40000m, // Placeholder - Giá thực tế = 40% giá sách
                    DurationDays = 30,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 180 ngày",
                    Description = "Thuê sách trong 180 ngày - 60% giá sách",
                    Price = 120000m, // Placeholder - Giá thực tế = 60% giá sách
                    DurationDays = 180,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Gói đăng ký (Subscription)
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Gói cơ bản - 1 tháng",
                    Description = "Đọc không giới hạn ebook trong 1 tháng. Truy cập hơn 1000 đầu sách.",
                    Price = 79000m,
                    DurationDays = 30,
                    PlanType = "Subscription",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Gói tiêu chuẩn - 3 tháng",
                    Description = "Đọc không giới hạn ebook trong 3 tháng. Tiết kiệm 15%. Truy cập toàn bộ thư viện.",
                    Price = 199000m,
                    DurationDays = 90,
                    PlanType = "Subscription",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Gói cao cấp - 6 tháng",
                    Description = "Đọc không giới hạn ebook trong 6 tháng. Tiết kiệm 25%. Ưu tiên truy cập sách mới.",
                    Price = 359000m,
                    DurationDays = 180,
                    PlanType = "Subscription",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Gói VIP - 1 năm",
                    Description = "Đọc không giới hạn ebook cả năm. Tiết kiệm 35%. Tất cả quyền lợi cao cấp + Audiobook miễn phí.",
                    Price = 599000m,
                    DurationDays = 365,
                    PlanType = "Subscription",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Gói dùng thử
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Dùng thử 3 ngày",
                    Description = "Dùng thử miễn phí trong 3 ngày. Không cần thẻ tín dụng.",
                    Price = 0m,
                    DurationDays = 3,
                    PlanType = "Subscription",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.RentalPlans.AddRangeAsync(rentalPlans);
            await context.SaveChangesAsync();
        }
    }
}
