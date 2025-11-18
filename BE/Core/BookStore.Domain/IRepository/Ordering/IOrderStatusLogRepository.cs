using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Domain.IRepository.Ordering
{
    public interface IOrderStatusLogRepository : IGenericRepository<OrderStatusLog>
    {
        /// <summary>
        /// Lấy lịch sử trạng thái của một đơn hàng
        /// </summary>
        Task<IEnumerable<OrderStatusLog>> GetByOrderIdAsync(Guid orderId);

        /// <summary>
        /// Tạo log mới khi thay đổi trạng thái đơn hàng
        /// </summary>
        Task<OrderStatusLog> CreateLogAsync(Guid orderId, string oldStatus, string newStatus, string? changedBy = null);

        /// <summary>
        /// Lấy log mới nhất của một đơn hàng
        /// </summary>
        Task<OrderStatusLog?> GetLatestByOrderIdAsync(Guid orderId);

        /// <summary>
        /// Lấy tất cả log theo khoảng thời gian
        /// </summary>
        Task<IEnumerable<OrderStatusLog>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate);
    }
}
