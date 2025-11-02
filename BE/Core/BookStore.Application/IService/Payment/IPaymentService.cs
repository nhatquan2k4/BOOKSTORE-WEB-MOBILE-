using BookStore.Application.Dtos.Payment;

namespace BookStore.Application.IService.Payment
{
    public interface IPaymentService
    {
        // Get Payments
        Task<PaymentTransactionDto?> GetPaymentByIdAsync(Guid paymentId);
        Task<PaymentTransactionDto?> GetPaymentByOrderIdAsync(Guid orderId);
        Task<PaymentTransactionDto?> GetPaymentByTransactionCodeAsync(string transactionCode);
        Task<(List<PaymentTransactionDto> Items, int TotalCount)> GetPaymentsByProviderAsync(string provider, int pageNumber = 1, int pageSize = 20);
        Task<(List<PaymentTransactionDto> Items, int TotalCount)> GetPaymentsByStatusAsync(string status, int pageNumber = 1, int pageSize = 20);
        
        // Create Payment
        Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentDto dto);
        Task<PaymentTransactionDto> CreatePaymentForOrderAsync(Guid orderId, string provider = "VietQR", string paymentMethod = "Online");
        
        // Update Payment
        Task<PaymentTransactionDto> UpdatePaymentStatusAsync(UpdatePaymentStatusDto dto);
        Task<PaymentTransactionDto> ProcessPaymentCallbackAsync(PaymentCallbackDto dto);
        Task MarkPaymentAsSuccessAsync(Guid paymentId);
        Task MarkPaymentAsFailedAsync(Guid paymentId);
        
        // Validation & Check
        Task<bool> IsTransactionCodeExistsAsync(string transactionCode);
        Task<List<PaymentTransactionDto>> GetExpiredPendingPaymentsAsync(int minutesThreshold = 15);
        Task CancelExpiredPaymentsAsync();
        
        // Statistics
        Task<Dictionary<string, int>> GetPaymentCountByProviderAsync(DateTime fromDate, DateTime toDate);
    }
}
