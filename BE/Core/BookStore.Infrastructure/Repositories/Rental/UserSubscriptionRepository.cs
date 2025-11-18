using BookStore.Domain.Entities.Rental;
using BookStore.Domain.IRepository.Rental;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Rental
{
    public class UserSubscriptionRepository : GenericRepository<UserSubscription>, IUserSubscriptionRepository
    {
        public UserSubscriptionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<UserSubscription>> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserSubscriptions
                .Include(us => us.RentalPlan)
                .Where(us => us.UserId == userId)
                .OrderByDescending(us => us.CreatedAt)
                .ToListAsync();
        }

        public async Task<UserSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId)
        {
            return await _context.UserSubscriptions
                .Include(us => us.RentalPlan)
                .Where(us => us.UserId == userId
                    && us.Status == "Active"
                    && us.IsPaid
                    && us.EndDate > DateTime.UtcNow)
                .OrderByDescending(us => us.EndDate)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasActiveSubscriptionAsync(Guid userId)
        {
            return await _context.UserSubscriptions
                .AnyAsync(us => us.UserId == userId
                    && us.Status == "Active"
                    && us.IsPaid
                    && us.EndDate > DateTime.UtcNow);
        }

        public async Task<UserSubscription?> GetByTransactionCodeAsync(string transactionCode)
        {
            return await _context.UserSubscriptions
                .Include(us => us.RentalPlan)
                .Include(us => us.User)
                .FirstOrDefaultAsync(us => us.PaymentTransactionCode == transactionCode);
        }

        public async Task<IEnumerable<UserSubscription>> GetExpiredSubscriptionsAsync()
        {
            return await _context.UserSubscriptions
                .Where(us => us.Status == "Active"
                    && us.EndDate <= DateTime.UtcNow)
                .ToListAsync();
        }
    }
}
