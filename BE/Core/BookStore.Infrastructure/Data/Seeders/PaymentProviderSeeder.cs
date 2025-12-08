using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class PaymentProviderSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.PaymentProviders.AnyAsync())
                return;

            var providers = new[]
            {
                new PaymentProvider
                {
                    Id = Guid.NewGuid(),
                    Name = "VNPay",
                    ApiUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                    PublicKey = "VNPAY_PUBLIC_KEY_SANDBOX",
                    SecretKey = "VNPAY_SECRET_KEY_SANDBOX",
                    IsSandbox = true
                },
                new PaymentProvider
                {
                    Id = Guid.NewGuid(),
                    Name = "MoMo",
                    ApiUrl = "https://test-payment.momo.vn/v2/gateway/api/create",
                    PublicKey = "MOMO_PUBLIC_KEY_SANDBOX",
                    SecretKey = "MOMO_SECRET_KEY_SANDBOX",
                    IsSandbox = true
                },
                new PaymentProvider
                {
                    Id = Guid.NewGuid(),
                    Name = "ZaloPay",
                    ApiUrl = "https://sb-openapi.zalopay.vn/v2/create",
                    PublicKey = "ZALOPAY_APP_ID_SANDBOX",
                    SecretKey = "ZALOPAY_SECRET_KEY_SANDBOX",
                    IsSandbox = true
                },
                new PaymentProvider
                {
                    Id = Guid.NewGuid(),
                    Name = "Paypal",
                    ApiUrl = "https://api-m.sandbox.paypal.com",
                    PublicKey = "PAYPAL_CLIENT_ID_SANDBOX",
                    SecretKey = "PAYPAL_CLIENT_SECRET_SANDBOX",
                    IsSandbox = true
                },
                new PaymentProvider
                {
                    Id = Guid.NewGuid(),
                    Name = "Stripe",
                    ApiUrl = "https://api.stripe.com/v1",
                    PublicKey = "pk_test_STRIPE_PUBLISHABLE_KEY",
                    SecretKey = "sk_test_STRIPE_SECRET_KEY",
                    IsSandbox = true
                }
            };

            await context.PaymentProviders.AddRangeAsync(providers);
            await context.SaveChangesAsync();
        }
    }
}
