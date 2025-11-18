using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.Entities.Common
{
    public class Comment
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        // Comment on Book or Review (only one should be set)
        public Guid? BookId { get; set; }
        public virtual Book? Book { get; set; }

        public Guid? ReviewId { get; set; }
        public virtual Review? Review { get; set; }

        // Comment hierarchy (reply to another comment)
        public Guid? ParentCommentId { get; set; }
        public virtual Comment? ParentComment { get; set; }
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();

        public string Content { get; set; } = null!;
        public bool IsEdited { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
