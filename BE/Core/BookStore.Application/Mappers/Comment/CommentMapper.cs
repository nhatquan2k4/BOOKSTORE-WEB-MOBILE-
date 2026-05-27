using BookStore.Application.DTOs.Comment;
using CommentEntity = BookStore.Domain.Entities.Common.Comment;

namespace BookStore.Application.Mappers.Comment
{
    public static class CommentMapper
    {
        public static CommentDto ToDto(this CommentEntity comment, int replyCount)
        {
            return new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                UserName = comment.User?.Profiles?.FullName ?? "Anonymous",
                Content = comment.Content,
                ParentCommentId = comment.ParentCommentId,
                ReplyCount = replyCount,
                IsEdited = comment.IsEdited,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            };
        }
    }
}
