using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Domain.IRepository.Payment
{
    public interface IPaymentTransactionRepository : IGenericRepository<PaymentTransaction>
    {
        // Lấy payment kèm thông tin order
        Task<PaymentTransaction?> GetPaymentWithOrderAsync(Guid paymentId);
        
        // Lấy payment theo OrderId
        Task<PaymentTransaction?> GetByOrderIdAsync(Guid orderId);
        
        // Lấy payment theo TransactionCode (mã giao dịch từ VietQR/VNPay)
        Task<PaymentTransaction?> GetByTransactionCodeAsync(string transactionCode);
        
        // Lấy danh sách payment theo provider (VietQR, VNPay, MoMo, COD)
        Task<IEnumerable<PaymentTransaction>> GetByProviderAsync(string provider, int skip = 0, int take = 20);
        
        // Lấy payment theo status (Pending, Success, Failed, Refunded)
        Task<IEnumerable<PaymentTransaction>> GetByStatusAsync(string status, int skip = 0, int take = 20);
        
        // Cập nhật status payment (khi webhook callback)
        Task UpdatePaymentStatusAsync(Guid paymentId, string newStatus, DateTime? paidAt = null);
        
        // Thống kê payment theo provider
        Task<Dictionary<string, int>> GetPaymentCountByProviderAsync(DateTime fromDate, DateTime toDate);
        
        // Lấy pending payments cũ (quá 15 phút chưa thanh toán -> auto cancel)
        Task<IEnumerable<PaymentTransaction>> GetExpiredPendingPaymentsAsync(int minutesThreshold = 15);
        
        // Kiểm tra TransactionCode đã tồn tại chưa (tránh duplicate)
        Task<bool> IsTransactionCodeExistsAsync(string transactionCode);
    }
}