using BookStore.Domain.Entities.Common;

namespace BookStore.Domain.IRepository.Review
{
    public interface IReviewRepository : IGenericRepository<Entities.Common.Review>
    {
        Task<Entities.Common.Review?> GetByIdWithDetailsAsync(Guid id);
        Task<IEnumerable<Entities.Common.Review>> GetApprovedReviewsByBookIdAsync(Guid bookId, int page, int pageSize, string? sortBy = null);
        Task<bool> HasUserPurchasedBookAsync(Guid userId, Guid bookId);
        Task<bool> HasUserReviewedBookAsync(Guid userId, Guid bookId);
        Task<Entities.Common.Review?> GetUserReviewForBookAsync(Guid userId, Guid bookId);
        Task<int> GetTotalReviewsCountByBookIdAsync(Guid bookId, bool approvedOnly = true);
        Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid bookId);
        Task<IEnumerable<Entities.Common.Review>> GetPendingReviewsAsync(int page, int pageSize);
        Task<int> GetPendingReviewsCountAsync();
    }
}
