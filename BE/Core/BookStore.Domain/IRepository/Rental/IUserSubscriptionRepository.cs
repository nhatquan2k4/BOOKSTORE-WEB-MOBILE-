using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IUserSubscriptionRepository : IGenericRepository<UserSubscription>
    {

        Task<IEnumerable<UserSubscription>> GetByUserIdAsync(Guid userId);


        Task<UserSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId);


        Task<bool> HasActiveSubscriptionAsync(Guid userId);


        Task<UserSubscription?> GetByTransactionCodeAsync(string transactionCode);


        Task<IEnumerable<UserSubscription>> GetExpiredSubscriptionsAsync();
    }
}
