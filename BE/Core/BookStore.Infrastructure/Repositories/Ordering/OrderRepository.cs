using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Ordering
{
    public class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        public OrderRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Order?> GetOrderWithDetailsAsync(Guid orderId)
        {
            return await _dbSet
                .Include(o => o.Items).ThenInclude(i => i.Book)
                .Include(o => o.Address)
                .Include(o => o.PaymentTransaction).ThenInclude(p => p.Refunds)
                .Include(o => o.StatusLogs)
                .Include(o => o.Histories)
                .Include(o => o.Coupon)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
        {
            return await _dbSet
                .Include(o => o.Items).ThenInclude(i => i.Book)
                .Include(o => o.Address)
                .Include(o => o.PaymentTransaction)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, string? status = null, int skip = 0, int take = 10)
        {
            var query = _dbSet.AsQueryable();

            // Apply filters first
            query = query.Where(o => o.UserId == userId);
            
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            // Then apply includes, order, and pagination
            return await query
                .Include(o => o.Items).ThenInclude(i => i.Book)
                .Include(o => o.Address)
                .Include(o => o.PaymentTransaction)
                .OrderByDescending(o => o.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<int> CountOrdersByUserIdAsync(Guid userId, string? status = null)
        {
            var query = _dbSet.Where(o => o.UserId == userId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            return await query.CountAsync();
        }

        public async Task<IEnumerable<Order>> GetOrdersForShippingAsync(int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(o => o.Status == "Paid")
                .Include(o => o.Items).ThenInclude(i => i.Book)
                .Include(o => o.Address)
                .Include(o => o.User)
                .OrderBy(o => o.PaidAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string newStatus, string? note = null)
        {
            var order = await GetByIdAsync(orderId);
            if (order == null) return;

            var oldStatus = order.Status;
            order.Status = newStatus;

            // Cập nhật timestamps tương ứng
            switch (newStatus)
            {
                case "Paid":
                    order.PaidAt = DateTime.UtcNow;
                    break;
                case "Completed":
                    order.CompletedAt = DateTime.UtcNow;
                    break;
                case "Cancelled":
                    order.CancelledAt = DateTime.UtcNow;
                    break;
            }

            // Track StatusLog - TODO: Implement OrderStatusLog entity
            // order.StatusLogs.Add(new OrderStatusLog
            // {
            //     Id = Guid.NewGuid(),
            //     OrderId = orderId,
            //     OldStatus = oldStatus,
            //     NewStatus = newStatus,
            //     ChangedAt = DateTime.UtcNow,
            //     Note = note
            // });

            // Track History - TODO: Implement OrderHistory entity
            // order.Histories.Add(new OrderHistory
            // {
            //     Id = Guid.NewGuid(),
            //     OrderId = orderId,
            //     Action = $"Status changed from {oldStatus} to {newStatus}",
            //     ChangedAt = DateTime.UtcNow,
            //     Note = note
            // });

            Update(order);
        }

        public async Task<IEnumerable<Order>> GetOrdersByStatusAsync(string status, int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(o => o.Status == status)
                .Include(o => o.Items).ThenInclude(i => i.Book)
                .Include(o => o.Address)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<bool> IsOrderOwnedByUserAsync(Guid orderId, Guid userId)
        {
            return await _dbSet.AnyAsync(o => o.Id == orderId && o.UserId == userId);
        }

        public async Task<decimal> GetTotalRevenueAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Where(o => o.Status == "Completed" 
                    && o.CompletedAt >= fromDate 
                    && o.CompletedAt <= toDate)
                .SumAsync(o => o.FinalAmount);
        }

        public async Task<IEnumerable<Order>> GetPendingCompletionOrdersAsync()
        {
            return await _dbSet
                .Where(o => o.Status == "Paid" || o.Status == "Shipped")
                .Include(o => o.Items)
                .Include(o => o.Address)
                .Include(o => o.User)
                .OrderBy(o => o.PaidAt)
                .ToListAsync();
        }
    }
}