using BookStore.Domain.Entities.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Common
{
    public class CommentConfiguration : IEntityTypeConfiguration<Comment>
    {
        public void Configure(EntityTypeBuilder<Comment> builder)
        {
            // Table configuration
            builder.ToTable("Comments", "common", t =>
            {
                t.HasCheckConstraint(
                    "CK_Comment_BookOrReview",
                    "(BookId IS NOT NULL AND ReviewId IS NULL) OR (BookId IS NULL AND ReviewId IS NOT NULL)");
            });

            // Primary Key
            builder.HasKey(c => c.Id);

            // Properties
            builder.Property(c => c.Content)
                .HasMaxLength(1000)
                .IsRequired()
                .HasComment("Comment content");

            builder.Property(c => c.IsEdited)
                .HasDefaultValue(false);

            builder.Property(c => c.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(c => c.UpdatedAt)
                .IsRequired(false);

            // Relationships
            // User → Comments
            builder.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Book → Comments (optional)
            builder.HasOne(c => c.Book)
                .WithMany()
                .HasForeignKey(c => c.BookId)
                .OnDelete(DeleteBehavior.NoAction);

            // Review → Comments (optional)
            builder.HasOne(c => c.Review)
                .WithMany()
                .HasForeignKey(c => c.ReviewId)
                .OnDelete(DeleteBehavior.NoAction);

            // Self-referencing for replies
            builder.HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(c => c.BookId);
            builder.HasIndex(c => c.ReviewId);
            builder.HasIndex(c => c.UserId);
            builder.HasIndex(c => c.ParentCommentId);
            builder.HasIndex(c => c.CreatedAt);
        }
    }
}
