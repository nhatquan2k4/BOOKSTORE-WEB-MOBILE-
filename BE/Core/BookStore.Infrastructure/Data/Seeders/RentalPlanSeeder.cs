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
                // Gói thuê đơn lẻ (SingleBook)
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 7 ngày",
                    Description = "Thuê sách trong 7 ngày",
                    Price = 15000m,
                    DurationDays = 7,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 14 ngày",
                    Description = "Thuê sách trong 14 ngày - Tiết kiệm 10%",
                    Price = 25000m,
                    DurationDays = 14,
                    PlanType = "SingleBook",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new RentalPlan
                {
                    Id = Guid.NewGuid(),
                    Name = "Thuê 30 ngày",
                    Description = "Thuê sách trong 30 ngày - Tiết kiệm 20%",
                    Price = 40000m,
                    DurationDays = 30,
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
