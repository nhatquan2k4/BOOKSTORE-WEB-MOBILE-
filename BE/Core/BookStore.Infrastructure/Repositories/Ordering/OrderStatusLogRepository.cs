using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Ordering
{
    public class OrderStatusLogRepository : GenericRepository<OrderStatusLog>, IOrderStatusLogRepository
    {
        public OrderStatusLogRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<OrderStatusLog>> GetByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Where(log => log.OrderId == orderId)
                .Include(log => log.Order)
                .OrderBy(log => log.ChangedAt)
                .ToListAsync();
        }

        public async Task<OrderStatusLog> CreateLogAsync(Guid orderId, string oldStatus, string newStatus, string? changedBy = null)
        {
            var log = new OrderStatusLog
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                ChangedAt = DateTime.UtcNow,
                ChangedBy = changedBy ?? "System"
            };

            await _dbSet.AddAsync(log);
            await _context.SaveChangesAsync();

            return await _dbSet
                .Include(l => l.Order)
                .FirstAsync(l => l.Id == log.Id);
        }

        public async Task<OrderStatusLog?> GetLatestByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Where(log => log.OrderId == orderId)
                .Include(log => log.Order)
                .OrderByDescending(log => log.ChangedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<OrderStatusLog>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Where(log => log.ChangedAt >= fromDate && log.ChangedAt <= toDate)
                .Include(log => log.Order)
                .OrderByDescending(log => log.ChangedAt)
                .ToListAsync();
        }
    }
}
