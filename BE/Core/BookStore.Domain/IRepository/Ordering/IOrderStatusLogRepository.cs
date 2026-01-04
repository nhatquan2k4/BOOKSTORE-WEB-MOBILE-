using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Domain.IRepository.Ordering
{
    public interface IOrderStatusLogRepository : IGenericRepository<OrderStatusLog>
    {

        Task<IEnumerable<OrderStatusLog>> GetByOrderIdAsync(Guid orderId);


        Task<OrderStatusLog> CreateLogAsync(Guid orderId, string oldStatus, string newStatus, string? changedBy = null);


        Task<OrderStatusLog?> GetLatestByOrderIdAsync(Guid orderId);

        Task<IEnumerable<OrderStatusLog>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate);
    }
}
