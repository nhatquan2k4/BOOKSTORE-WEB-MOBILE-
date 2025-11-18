using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.DTOs.Comment
{
    public class CreateCommentDto
    {
        [Required(ErrorMessage = "Content is required")]
        [MinLength(1, ErrorMessage = "Content must be at least 1 character")]
        [MaxLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
        public string Content { get; set; } = null!;

        public Guid? ParentCommentId { get; set; }
    }

    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
        public int ReplyCount { get; set; }
        public bool IsEdited { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UpdateCommentDto
    {
        [Required(ErrorMessage = "Content is required")]
        [MinLength(1, ErrorMessage = "Content must be at least 1 character")]
        [MaxLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
        public string Content { get; set; } = null!;
    }
}
