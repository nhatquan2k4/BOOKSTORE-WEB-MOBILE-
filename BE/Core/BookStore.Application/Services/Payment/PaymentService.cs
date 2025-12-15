using BookStore.Application.Dtos.Payment;
using BookStore.Application.IService.Payment;
using BookStore.Application.Mappers.Payment;
using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Domain.IRepository.Payment;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentTransactionRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IPaymentTransactionRepository paymentRepository,
            IOrderRepository orderRepository,
            ILogger<PaymentService> logger)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _logger = logger;
        }


        public async Task<PaymentTransactionDto?> GetPaymentByIdAsync(Guid paymentId)
        {
            var payment = await _paymentRepository.GetPaymentWithOrderAsync(paymentId);
            return payment?.ToDto();
        }

        public async Task<PaymentTransactionDto?> GetPaymentByOrderIdAsync(Guid orderId)
        {
            var payment = await _paymentRepository.GetByOrderIdAsync(orderId);
            return payment?.ToDto();
        }

        public async Task<PaymentTransactionDto?> GetPaymentByTransactionCodeAsync(string transactionCode)
        {
            var payment = await _paymentRepository.GetByTransactionCodeAsync(transactionCode);
            return payment?.ToDto();
        }

        public async Task<(List<PaymentTransactionDto> Items, int TotalCount)> GetPaymentsByProviderAsync(string provider, int pageNumber = 1, int pageSize = 20)
        {
            var skip = (pageNumber - 1) * pageSize;
            var payments = await _paymentRepository.GetByProviderAsync(provider, skip, pageSize);

            var paymentDtos = payments.Select(p => p.ToDto()).ToList();
            var totalCount = paymentDtos.Count; // Approximate

            return (paymentDtos, totalCount);
        }

        public async Task<(List<PaymentTransactionDto> Items, int TotalCount)> GetPaymentsByStatusAsync(string status, int pageNumber = 1, int pageSize = 20)
        {
            var skip = (pageNumber - 1) * pageSize;
            var payments = await _paymentRepository.GetByStatusAsync(status, skip, pageSize);

            var paymentDtos = payments.Select(p => p.ToDto()).ToList();
            var totalCount = paymentDtos.Count; // Approximate

            return (paymentDtos, totalCount);
        }


        public async Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentDto dto)
        {
            // Validate order exists
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            // Check if payment already exists for this order
            var existingPayment = await _paymentRepository.GetByOrderIdAsync(dto.OrderId);
            Guard.Against(existingPayment != null, "Đơn hàng này đã có giao dịch thanh toán");

            // Generate transaction code
            var transactionCode = GenerateTransactionCode();

            var payment = new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                OrderId = dto.OrderId,
                Provider = dto.Provider,
                TransactionCode = transactionCode,
                PaymentMethod = dto.PaymentMethod,
                Amount = dto.Amount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.SaveChangesAsync();

            _logger.LogInformation($"Payment created: {transactionCode} for order {dto.OrderId}");

            return payment.ToDto();
        }

        public async Task<PaymentTransactionDto> CreatePaymentForOrderAsync(Guid orderId, string provider = "VietQR", string paymentMethod = "Online")
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            Guard.Against(order == null, "Đơn hàng không tồn tại");

            var dto = new CreatePaymentDto
            {
                OrderId = orderId,
                Provider = provider,
                PaymentMethod = paymentMethod,
                Amount = order!.FinalAmount
            };

            return await CreatePaymentAsync(dto);
        }


        public async Task<PaymentTransactionDto> UpdatePaymentStatusAsync(UpdatePaymentStatusDto dto)
        {
            var payment = await _paymentRepository.GetByIdAsync(dto.PaymentId);
            Guard.Against(payment == null, "Giao dịch không tồn tại");

            // Update transaction code if provided
            if (!string.IsNullOrEmpty(dto.TransactionCode) && payment!.TransactionCode != dto.TransactionCode)
            {
                payment.TransactionCode = dto.TransactionCode;
            }

            await _paymentRepository.UpdatePaymentStatusAsync(dto.PaymentId, dto.NewStatus, dto.PaidAt);
            await _paymentRepository.SaveChangesAsync();

            // If payment is successful, update order status
            if (dto.NewStatus == "Success")
            {
                await _orderRepository.UpdateOrderStatusAsync(payment!.OrderId, "Paid", "Payment confirmed");
                await _orderRepository.SaveChangesAsync();
            }

            var updatedPayment = await _paymentRepository.GetPaymentWithOrderAsync(dto.PaymentId);
            return updatedPayment!.ToDto();
        }

        public async Task<PaymentTransactionDto> ProcessPaymentCallbackAsync(PaymentCallbackDto dto)
        {
            var payment = await _paymentRepository.GetByTransactionCodeAsync(dto.TransactionCode);
            Guard.Against(payment == null, $"Không tìm thấy giao dịch với mã {dto.TransactionCode}");

            var updateDto = new UpdatePaymentStatusDto
            {
                PaymentId = payment!.Id,
                TransactionCode = dto.TransactionCode,
                NewStatus = dto.Status,
                PaidAt = dto.Status == "Success" ? dto.PaidAt : null
            };

            return await UpdatePaymentStatusAsync(updateDto);
        }

        public async Task MarkPaymentAsSuccessAsync(Guid paymentId)
        {
            var dto = new UpdatePaymentStatusDto
            {
                PaymentId = paymentId,
                NewStatus = "Success",
                PaidAt = DateTime.UtcNow
            };

            await UpdatePaymentStatusAsync(dto);
        }

        public async Task MarkPaymentAsFailedAsync(Guid paymentId)
        {
            var dto = new UpdatePaymentStatusDto
            {
                PaymentId = paymentId,
                NewStatus = "Failed",
                PaidAt = null
            };

            await UpdatePaymentStatusAsync(dto);
        }


        public async Task<bool> IsTransactionCodeExistsAsync(string transactionCode)
        {
            return await _paymentRepository.IsTransactionCodeExistsAsync(transactionCode);
        }

        public async Task<List<PaymentTransactionDto>> GetExpiredPendingPaymentsAsync(int minutesThreshold = 15)
        {
            var expiredPayments = await _paymentRepository.GetExpiredPendingPaymentsAsync(minutesThreshold);
            return expiredPayments.Select(p => p.ToDto()).ToList();
        }

        public async Task CancelExpiredPaymentsAsync()
        {
            var expiredPayments = await _paymentRepository.GetExpiredPendingPaymentsAsync(15);

            foreach (var payment in expiredPayments)
            {
                await _paymentRepository.UpdatePaymentStatusAsync(payment.Id, "Failed", null);
                await _orderRepository.UpdateOrderStatusAsync(payment.OrderId, "Cancelled", "Payment timeout");

                _logger.LogInformation($"Cancelled expired payment: {payment.TransactionCode}");
            }

            await _paymentRepository.SaveChangesAsync();
            await _orderRepository.SaveChangesAsync();
        }


        public async Task<Dictionary<string, int>> GetPaymentCountByProviderAsync(DateTime fromDate, DateTime toDate)
        {
            return await _paymentRepository.GetPaymentCountByProviderAsync(fromDate, toDate);
        }


        // Mapping delegated to PaymentMapper for better separation of concerns

        private string GenerateTransactionCode()
        {
            // Format: PAY-YYYYMMDD-HHMMSS-XXXX
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
            var random = new Random().Next(1000, 9999);
            return $"PAY-{timestamp}-{random}";
        }
    }
}
