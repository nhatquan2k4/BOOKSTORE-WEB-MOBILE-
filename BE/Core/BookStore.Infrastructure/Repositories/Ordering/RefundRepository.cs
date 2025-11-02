using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Ordering
{
    public class RefundRepository : GenericRepository<Refund>, IRefundRepository
    {
        public RefundRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Refund>> GetRefundsByPaymentIdAsync(Guid paymentId)
        {
            return await _dbSet
                .Where(r => r.PaymentTransactionId == paymentId)
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();
        }

        public async Task<Refund?> GetRefundWithDetailsAsync(Guid refundId)
        {
            return await _dbSet
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                        .ThenInclude(o => o.Items)
                            .ThenInclude(i => i.Book)
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                        .ThenInclude(o => o.User)
                .FirstOrDefaultAsync(r => r.Id == refundId);
        }

        public async Task<Refund?> GetByRefundCodeAsync(string refundCode)
        {
            // RefundCode doesn't exist in Refund entity, return by Id instead
            return await _dbSet
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                .FirstOrDefaultAsync(r => r.Id.ToString() == refundCode);
        }

        public async Task<IEnumerable<Refund>> GetRefundsByStatusAsync(string status, int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(r => r.Status == status)
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                        .ThenInclude(o => o.User)
                .OrderByDescending(r => r.RequestedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<Refund>> GetPendingRefundsAsync(int skip = 0, int take = 20)
        {
            return await GetRefundsByStatusAsync("Pending", skip, take);
        }

        public async Task<IEnumerable<Refund>> GetRefundsByUserIdAsync(Guid userId, int skip = 0, int take = 10)
        {
            return await _dbSet
                .Where(r => r.PaymentTransaction.Order.UserId == userId)
                .Include(r => r.PaymentTransaction)
                    .ThenInclude(p => p.Order)
                        .ThenInclude(o => o.Items)
                .OrderByDescending(r => r.RequestedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task UpdateRefundStatusAsync(Guid refundId, string newStatus, string? note = null)
        {
            var refund = await _dbSet.FindAsync(refundId);
            if (refund == null) return;

            refund.Status = newStatus;
            // Update ProcessedAt when status changes to completed/approved/rejected
            if (newStatus == "Approved" || newStatus == "Rejected" || newStatus == "Completed")
            {
                refund.ProcessedAt = DateTime.UtcNow;
            }
            // Note: note parameter is accepted but not stored 
            // because Refund entity doesn't have Note property

            await SaveChangesAsync();
        }

        public async Task<decimal> GetTotalRefundedAmountAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Where(r => r.Status == "Completed" 
                    && r.ProcessedAt >= fromDate 
                    && r.ProcessedAt <= toDate)
                .SumAsync(r => r.Amount);
        }

        public async Task<Dictionary<string, int>> GetRefundCountByStatusAsync()
        {
            return await _dbSet
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);
        }

        public async Task<bool> HasPaymentBeenRefundedAsync(Guid paymentId)
        {
            return await _dbSet
                .AnyAsync(r => r.PaymentTransactionId == paymentId 
                    && (r.Status == "Approved" || r.Status == "Completed"));
        }

        public async Task<decimal> GetTotalRefundedForPaymentAsync(Guid paymentId)
        {
            return await _dbSet
                .Where(r => r.PaymentTransactionId == paymentId 
                    && (r.Status == "Approved" || r.Status == "Completed"))
                .SumAsync(r => r.Amount);
        }
    }
}