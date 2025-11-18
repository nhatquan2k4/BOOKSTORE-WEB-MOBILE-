using BookStore.Application.DTOs.Comment;

namespace BookStore.Application.IService.Comment
{
    public interface ICommentService
    {
        Task<CommentDto> CreateCommentOnBookAsync(Guid userId, Guid bookId, CreateCommentDto dto);
        Task<CommentDto> CreateCommentOnReviewAsync(Guid userId, Guid reviewId, CreateCommentDto dto);
        Task<(IEnumerable<CommentDto> Comments, int TotalCount)> GetBookCommentsAsync(Guid bookId, int page, int pageSize);
        Task<(IEnumerable<CommentDto> Comments, int TotalCount)> GetReviewCommentsAsync(Guid reviewId, int page, int pageSize);
        Task<IEnumerable<CommentDto>> GetRepliesAsync(Guid parentCommentId);
        Task<CommentDto> UpdateCommentAsync(Guid userId, Guid commentId, UpdateCommentDto dto);
        Task DeleteCommentAsync(Guid userId, Guid commentId, bool isAdmin = false);
    }
}
