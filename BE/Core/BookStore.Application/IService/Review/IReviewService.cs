using BookStore.Application.DTOs.Catalog.Review;

namespace BookStore.Application.IService.Review
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(Guid userId, Guid bookId, CreateReviewDto dto);
        Task<ReviewDto> UpdateReviewAsync(Guid userId, Guid bookId, UpdateReviewDto dto);
        Task<ReviewDto> CreateQuickRatingAsync(Guid userId, Guid bookId, QuickRatingDto dto);
        Task<(IEnumerable<ReviewListDto> Reviews, int TotalCount)> GetBookReviewsAsync(Guid bookId, int page, int pageSize, string? sortBy = null);
        Task<ReviewStatisticsDto> GetBookReviewStatisticsAsync(Guid bookId);
        Task<ReviewDto?> GetReviewByIdAsync(Guid id);
        Task<ReviewDto?> GetUserReviewForBookAsync(Guid userId, Guid bookId);
        Task<ReviewDto> ApproveReviewAsync(Guid id, Guid approvedBy);
        Task<ReviewDto> RejectReviewAsync(Guid id, string? reason);
        Task DeleteReviewAsync(Guid id);
        Task DeleteUserReviewAsync(Guid userId, Guid bookId);
        Task<(IEnumerable<ReviewDto> Reviews, int TotalCount)> GetPendingReviewsAsync(int page, int pageSize);
        Task<object> GetReviewEligibilityDebugAsync(Guid userId, Guid bookId);
    }
}
