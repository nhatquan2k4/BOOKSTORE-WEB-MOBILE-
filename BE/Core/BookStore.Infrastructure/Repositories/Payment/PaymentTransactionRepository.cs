using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.IRepository.Payment;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Payment
{
    public class PaymentTransactionRepository : GenericRepository<PaymentTransaction>, IPaymentTransactionRepository
    {
        public PaymentTransactionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PaymentTransaction?> GetPaymentWithOrderAsync(Guid paymentId)
        {
            return await _dbSet
                .Include(p => p.Order).ThenInclude(o => o.Items)
                .Include(p => p.Order).ThenInclude(o => o.Address)
                .Include(p => p.Order).ThenInclude(o => o.User)
                .Include(p => p.Refunds)
                .FirstOrDefaultAsync(p => p.Id == paymentId);
        }

        public async Task<PaymentTransaction?> GetByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Include(p => p.Refunds)
                .FirstOrDefaultAsync(p => p.OrderId == orderId);
        }

        public async Task<PaymentTransaction?> GetByTransactionCodeAsync(string transactionCode)
        {
            return await _dbSet
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.TransactionCode == transactionCode);
        }

        public async Task<IEnumerable<PaymentTransaction>> GetByProviderAsync(string provider, int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(p => p.Provider == provider)
                .Include(p => p.Order)
                .OrderByDescending(p => p.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<PaymentTransaction>> GetByStatusAsync(string status, int skip = 0, int take = 20)
        {
            return await _dbSet
                .Where(p => p.Status == status)
                .Include(p => p.Order)
                .OrderByDescending(p => p.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task UpdatePaymentStatusAsync(Guid paymentId, string newStatus, DateTime? paidAt = null)
        {
            var payment = await GetByIdAsync(paymentId);
            if (payment == null) return;

            payment.Status = newStatus;
            if (paidAt.HasValue)
            {
                payment.PaidAt = paidAt.Value;
            }

            Update(payment);
        }

        public async Task<Dictionary<string, int>> GetPaymentCountByProviderAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Where(p => p.CreatedAt >= fromDate && p.CreatedAt <= toDate)
                .GroupBy(p => p.Provider)
                .Select(g => new { Provider = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Provider, x => x.Count);
        }

        public async Task<IEnumerable<PaymentTransaction>> GetExpiredPendingPaymentsAsync(int minutesThreshold = 15)
        {
            var expiredTime = DateTime.UtcNow.AddMinutes(-minutesThreshold);
            return await _dbSet
                .Where(p => p.Status == "Pending" && p.CreatedAt < expiredTime)
                .Include(p => p.Order)
                .ToListAsync();
        }

        public async Task<bool> IsTransactionCodeExistsAsync(string transactionCode)
        {
            return await _dbSet.AnyAsync(p => p.TransactionCode == transactionCode);
        }
    }
}