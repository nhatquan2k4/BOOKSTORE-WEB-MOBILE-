using BookStore.Application.Dtos.Payment;
using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Application.Mappers.Payment
{
    public static class PaymentMapper
    {
        // PaymentTransaction Entity -> PaymentTransactionDto
        public static PaymentTransactionDto ToDto(this PaymentTransaction payment)
        {
            return new PaymentTransactionDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                OrderNumber = payment.Order?.OrderNumber ?? string.Empty,
                Provider = payment.Provider,
                TransactionCode = payment.TransactionCode,
                PaymentMethod = payment.PaymentMethod,
                Amount = payment.Amount,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                PaidAt = payment.PaidAt
            };
        }

        // CreatePaymentDto -> PaymentTransaction Entity
        public static PaymentTransaction ToEntity(this CreatePaymentDto dto)
        {
            return new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                OrderId = dto.OrderId,
                Provider = dto.Provider,
                TransactionCode = GenerateTransactionCode(),
                PaymentMethod = dto.PaymentMethod,
                Amount = dto.Amount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
        }

        // UpdatePaymentStatusDto -> Update PaymentTransaction Entity
        public static void UpdateFromDto(this PaymentTransaction payment, UpdatePaymentStatusDto dto)
        {
            if (!string.IsNullOrEmpty(dto.TransactionCode))
            {
                payment.TransactionCode = dto.TransactionCode;
            }

            if (!string.IsNullOrEmpty(dto.NewStatus))
            {
                payment.Status = dto.NewStatus;

                // Update PaidAt timestamp if status is Success
                if (dto.NewStatus == "Success" || dto.NewStatus == "Completed")
                {
                    payment.PaidAt = dto.PaidAt ?? DateTime.UtcNow;
                }
            }
        }

        // PaymentCallbackDto -> Update PaymentTransaction Entity
        public static void UpdateFromCallback(this PaymentTransaction payment, PaymentCallbackDto callback)
        {
            payment.TransactionCode = callback.TransactionCode;
            payment.Status = callback.Status;

            if (callback.Status == "Success" || callback.Status == "Completed")
            {
                payment.PaidAt = callback.PaidAt;
            }
        }

        // Helper method to generate transaction code
        private static string GenerateTransactionCode()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(100000, 999999);
            return $"TXN-{timestamp}-{random}";
        }
    }
}
