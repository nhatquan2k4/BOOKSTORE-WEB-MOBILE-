using BookStore.Domain.Entities.Ordering;

namespace BookStore.Domain.IRepository.Ordering
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        // Lấy order kèm đầy đủ thông tin (Items, Address, PaymentTransaction, StatusLogs, Histories)
        Task<Order?> GetOrderWithDetailsAsync(Guid orderId);
        
        // Lấy order theo OrderNumber (mã đơn hàng public cho user)
        Task<Order?> GetByOrderNumberAsync(string orderNumber);
        
        // Lấy danh sách order của user (có filter theo status, phân trang)
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, string? status = null, int skip = 0, int take = 10);
        
        // Đếm số order theo status của user
        Task<int> CountOrdersByUserIdAsync(Guid userId, string? status = null);
        
        // Lấy order cần ship (status = Paid)
        Task<IEnumerable<Order>> GetOrdersForShippingAsync(int skip = 0, int take = 20);
        
        // Cập nhật status và track history
        Task UpdateOrderStatusAsync(Guid orderId, string newStatus, string? note = null);
        
        // Lấy order theo status (cho admin)
        Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status, int skip = 0, int take = 20);
        
        // Kiểm tra user có quyền truy cập order không
        Task<bool> IsOrderOwnedByUserAsync(Guid orderId, Guid userId);
        
        // Thống kê doanh thu theo khoảng thời gian
        Task<decimal> GetTotalRevenueAsync(DateTime fromDate, DateTime toDate);
        
        // Lấy order đã thanh toán nhưng chưa hoàn thành (cho tracking)
        Task<IEnumerable<Order>> GetPendingCompletionOrdersAsync();
    }
}