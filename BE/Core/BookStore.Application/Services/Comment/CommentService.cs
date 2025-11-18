using BookStore.Application.DTOs.Comment;
using BookStore.Application.IService.Comment;
using BookStore.Domain.Entities.Common;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Comment;
using BookStore.Domain.IRepository.Review;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Comment
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly ILogger<CommentService> _logger;

        // Anti-spam configuration
        private const int MaxCommentsPerInterval = 5; // Max 5 comments
        private const int IntervalMinutes = 5; // In 5 minutes

        public CommentService(
            ICommentRepository commentRepository,
            IBookRepository bookRepository,
            IReviewRepository reviewRepository,
            ILogger<CommentService> logger)
        {
            _commentRepository = commentRepository;
            _bookRepository = bookRepository;
            _reviewRepository = reviewRepository;
            _logger = logger;
        }

        public async Task<CommentDto> CreateCommentOnBookAsync(Guid userId, Guid bookId, CreateCommentDto dto)
        {
            // 1. Check if book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            // 2. Anti-spam check
            await CheckSpamAsync(userId);

            // 3. If replying, check parent comment exists and belongs to this book
            if (dto.ParentCommentId.HasValue)
            {
                var parentComment = await _commentRepository.GetByIdAsync(dto.ParentCommentId.Value);
                if (parentComment == null || parentComment.BookId != bookId)
                    throw new InvalidOperationException("Parent comment not found or does not belong to this book");
            }

            // 4. Create comment
            var comment = new Domain.Entities.Common.Comment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = bookId,
                Content = dto.Content.Trim(),
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(comment);
            await _commentRepository.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created comment {CommentId} on book {BookId}", 
                userId, comment.Id, bookId);

            return await MapToCommentDto(comment);
        }

        public async Task<CommentDto> CreateCommentOnReviewAsync(Guid userId, Guid reviewId, CreateCommentDto dto)
        {
            // 1. Check if review exists
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
                throw new InvalidOperationException("Review not found");

            // 2. Anti-spam check
            await CheckSpamAsync(userId);

            // 3. If replying, check parent comment exists and belongs to this review
            if (dto.ParentCommentId.HasValue)
            {
                var parentComment = await _commentRepository.GetByIdAsync(dto.ParentCommentId.Value);
                if (parentComment == null || parentComment.ReviewId != reviewId)
                    throw new InvalidOperationException("Parent comment not found or does not belong to this review");
            }

            // 4. Create comment
            var comment = new Domain.Entities.Common.Comment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ReviewId = reviewId,
                Content = dto.Content.Trim(),
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(comment);
            await _commentRepository.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created comment {CommentId} on review {ReviewId}", 
                userId, comment.Id, reviewId);

            return await MapToCommentDto(comment);
        }

        public async Task<(IEnumerable<CommentDto> Comments, int TotalCount)> GetBookCommentsAsync(
            Guid bookId, int page, int pageSize)
        {
            var comments = await _commentRepository.GetCommentsByBookIdAsync(bookId, page, pageSize);
            var totalCount = await _commentRepository.GetCommentsCountByBookIdAsync(bookId);

            var commentDtos = new List<CommentDto>();
            foreach (var comment in comments)
            {
                commentDtos.Add(await MapToCommentDto(comment));
            }

            return (commentDtos, totalCount);
        }

        public async Task<(IEnumerable<CommentDto> Comments, int TotalCount)> GetReviewCommentsAsync(
            Guid reviewId, int page, int pageSize)
        {
            var comments = await _commentRepository.GetCommentsByReviewIdAsync(reviewId, page, pageSize);
            var totalCount = await _commentRepository.GetCommentsCountByReviewIdAsync(reviewId);

            var commentDtos = new List<CommentDto>();
            foreach (var comment in comments)
            {
                commentDtos.Add(await MapToCommentDto(comment));
            }

            return (commentDtos, totalCount);
        }

        public async Task<IEnumerable<CommentDto>> GetRepliesAsync(Guid parentCommentId)
        {
            var replies = await _commentRepository.GetRepliesByParentIdAsync(parentCommentId);

            var replyDtos = new List<CommentDto>();
            foreach (var reply in replies)
            {
                replyDtos.Add(await MapToCommentDto(reply));
            }

            return replyDtos;
        }

        public async Task<CommentDto> UpdateCommentAsync(Guid userId, Guid commentId, UpdateCommentDto dto)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null)
                throw new InvalidOperationException("Comment not found");

            if (comment.UserId != userId)
                throw new UnauthorizedAccessException("You can only edit your own comments");

            comment.Content = dto.Content.Trim();
            comment.IsEdited = true;
            comment.UpdatedAt = DateTime.UtcNow;

            _commentRepository.Update(comment);
            await _commentRepository.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated comment {CommentId}", userId, commentId);

            return await MapToCommentDto(comment);
        }

        public async Task DeleteCommentAsync(Guid userId, Guid commentId, bool isAdmin = false)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null)
                throw new InvalidOperationException("Comment not found");

            if (!isAdmin && comment.UserId != userId)
                throw new UnauthorizedAccessException("You can only delete your own comments");

            comment.IsDeleted = true;
            comment.UpdatedAt = DateTime.UtcNow;

            _commentRepository.Update(comment);
            await _commentRepository.SaveChangesAsync();

            _logger.LogInformation("Comment {CommentId} deleted by user {UserId} (Admin: {IsAdmin})", 
                commentId, userId, isAdmin);
        }

        private async Task CheckSpamAsync(Guid userId)
        {
            var recentCommentsCount = await _commentRepository.GetUserRecentCommentsCountAsync(
                userId, IntervalMinutes);

            if (recentCommentsCount >= MaxCommentsPerInterval)
            {
                throw new InvalidOperationException(
                    $"You have posted too many comments. Please wait before posting again. (Max {MaxCommentsPerInterval} comments per {IntervalMinutes} minutes)");
            }
        }

        private async Task<CommentDto> MapToCommentDto(Domain.Entities.Common.Comment comment)
        {
            // Load related entities if not loaded
            if (comment.User == null)
            {
                comment = await _commentRepository.GetByIdWithDetailsAsync(comment.Id)
                    ?? throw new InvalidOperationException("Comment not found");
            }

            // Count replies
            var replyCount = await _commentRepository.GetAllAsync();
            var count = replyCount.Count(r => r.ParentCommentId == comment.Id && !r.IsDeleted);

            return new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                UserName = comment.User?.Profiles?.FullName ?? "Anonymous",
                Content = comment.Content,
                ParentCommentId = comment.ParentCommentId,
                ReplyCount = count,
                IsEdited = comment.IsEdited,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            };
        }
    }
}
