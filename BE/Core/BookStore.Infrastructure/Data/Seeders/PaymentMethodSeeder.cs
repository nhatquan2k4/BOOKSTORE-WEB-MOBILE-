using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class PaymentMethodSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.PaymentMethods.AnyAsync())
                return;

            var paymentMethods = new[]
            {
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "COD",
                    Description = "Thanh toán khi nhận hàng (Cash On Delivery)",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "VNPay",
                    Description = "Thanh toán qua cổng VNPay - Hỗ trợ thẻ ATM, Visa, MasterCard, JCB",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "MoMo",
                    Description = "Thanh toán qua ví điện tử MoMo",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "ZaloPay",
                    Description = "Thanh toán qua ví điện tử ZaloPay",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "Chuyển khoản ngân hàng",
                    Description = "Chuyển khoản trực tiếp qua tài khoản ngân hàng",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "Thẻ tín dụng/Ghi nợ",
                    Description = "Thanh toán trực tiếp bằng thẻ Visa, MasterCard, JCB",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "ShopeePay",
                    Description = "Thanh toán qua ví điện tử ShopeePay",
                    IsActive = true
                },
                new PaymentMethod
                {
                    Id = Guid.NewGuid(),
                    Name = "Paypal",
                    Description = "Thanh toán quốc tế qua Paypal",
                    IsActive = false
                }
            };

            await context.PaymentMethods.AddRangeAsync(paymentMethods);
            await context.SaveChangesAsync();
        }
    }
}
