using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IUserSubscriptionRepository : IGenericRepository<UserSubscription>
    {
        /// <summary>
        /// Lấy tất cả subscription của user
        /// </summary>
        Task<IEnumerable<UserSubscription>> GetByUserIdAsync(Guid userId);

        /// <summary>
        /// Lấy subscription còn hạn của user (Active và chưa hết hạn)
        /// </summary>
        Task<UserSubscription?> GetActiveSubscriptionByUserIdAsync(Guid userId);

        /// <summary>
        /// Kiểm tra user có subscription còn hạn không
        /// </summary>
        Task<bool> HasActiveSubscriptionAsync(Guid userId);

        /// <summary>
        /// Lấy subscription theo payment transaction code
        /// </summary>
        Task<UserSubscription?> GetByTransactionCodeAsync(string transactionCode);

        /// <summary>
        /// Lấy tất cả subscription hết hạn (để tự động cập nhật status)
        /// </summary>
        Task<IEnumerable<UserSubscription>> GetExpiredSubscriptionsAsync();
    }
}
