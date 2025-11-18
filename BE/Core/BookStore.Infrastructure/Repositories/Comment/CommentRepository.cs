using BookStore.Domain.Entities.Common;
using BookStore.Domain.IRepository.Comment;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Comment
{
    public class CommentRepository : GenericRepository<Domain.Entities.Common.Comment>, ICommentRepository
    {
        public CommentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Domain.Entities.Common.Comment?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(c => c.User)
                    .ThenInclude(u => u.Profiles)
                .Include(c => c.ParentComment)
                .Include(c => c.Replies)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Domain.Entities.Common.Comment>> GetCommentsByBookIdAsync(Guid bookId, int page, int pageSize)
        {
            return await _dbSet
                .Include(c => c.User)
                    .ThenInclude(u => u.Profiles)
                .Where(c => c.BookId == bookId && !c.IsDeleted && c.ParentCommentId == null)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<Domain.Entities.Common.Comment>> GetCommentsByReviewIdAsync(Guid reviewId, int page, int pageSize)
        {
            return await _dbSet
                .Include(c => c.User)
                    .ThenInclude(u => u.Profiles)
                .Where(c => c.ReviewId == reviewId && !c.IsDeleted && c.ParentCommentId == null)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCommentsCountByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .CountAsync(c => c.BookId == bookId && !c.IsDeleted && c.ParentCommentId == null);
        }

        public async Task<int> GetCommentsCountByReviewIdAsync(Guid reviewId)
        {
            return await _dbSet
                .CountAsync(c => c.ReviewId == reviewId && !c.IsDeleted && c.ParentCommentId == null);
        }

        public async Task<int> GetUserRecentCommentsCountAsync(Guid userId, int minutes)
        {
            var cutoffTime = DateTime.UtcNow.AddMinutes(-minutes);
            return await _dbSet
                .CountAsync(c => c.UserId == userId && c.CreatedAt >= cutoffTime && !c.IsDeleted);
        }

        public async Task<IEnumerable<Domain.Entities.Common.Comment>> GetRepliesByParentIdAsync(Guid parentCommentId)
        {
            return await _dbSet
                .Include(c => c.User)
                    .ThenInclude(u => u.Profiles)
                .Where(c => c.ParentCommentId == parentCommentId && !c.IsDeleted)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }
    }
}
