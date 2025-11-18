using BookStore.Domain.Entities.Common;
using CommentEntity = BookStore.Domain.Entities.Common.Comment;

namespace BookStore.Domain.IRepository.Comment
{
    public interface ICommentRepository : IGenericRepository<CommentEntity>
    {
        Task<CommentEntity?> GetByIdWithDetailsAsync(Guid id);
        Task<IEnumerable<CommentEntity>> GetCommentsByBookIdAsync(Guid bookId, int page, int pageSize);
        Task<IEnumerable<CommentEntity>> GetCommentsByReviewIdAsync(Guid reviewId, int page, int pageSize);
        Task<int> GetCommentsCountByBookIdAsync(Guid bookId);
        Task<int> GetCommentsCountByReviewIdAsync(Guid reviewId);
        Task<int> GetUserRecentCommentsCountAsync(Guid userId, int minutes);
        Task<IEnumerable<CommentEntity>> GetRepliesByParentIdAsync(Guid parentCommentId);
    }
}
