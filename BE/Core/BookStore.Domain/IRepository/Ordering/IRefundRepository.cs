using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Domain.IRepository.Ordering
{
    public interface IRefundRepository : IGenericRepository<Refund>
    {
        // Lấy tất cả refunds của một payment
        Task<IEnumerable<Refund>> GetRefundsByPaymentIdAsync(Guid paymentId);
        
        // Lấy refund kèm thông tin payment và order
        Task<Refund?> GetRefundWithDetailsAsync(Guid refundId);
        
        // Lấy refund theo RefundCode
        Task<Refund?> GetByRefundCodeAsync(string refundCode);
        
        // Lấy refunds theo status (Pending, Approved, Rejected, Completed)
        Task<IEnumerable<Refund>> GetRefundsByStatusAsync(string status, int skip = 0, int take = 20);
        
        // Lấy refunds đang chờ xử lý (Pending)
        Task<IEnumerable<Refund>> GetPendingRefundsAsync(int skip = 0, int take = 20);
        
        // Lấy refunds của user
        Task<IEnumerable<Refund>> GetRefundsByUserIdAsync(Guid userId, int skip = 0, int take = 10);
        
        // Cập nhật status refund
        Task UpdateRefundStatusAsync(Guid refundId, string newStatus, string? note = null);
        
        // Tính tổng số tiền đã refund trong khoảng thời gian
        Task<decimal> GetTotalRefundedAmountAsync(DateTime fromDate, DateTime toDate);
        
        // Đếm số refund theo status
        Task<Dictionary<string, int>> GetRefundCountByStatusAsync();
        
        // Kiểm tra payment đã được refund chưa
        Task<bool> HasPaymentBeenRefundedAsync(Guid paymentId);
        
        // Lấy tổng số tiền đã refund cho một payment
        Task<decimal> GetTotalRefundedForPaymentAsync(Guid paymentId);
    }
}