using BookStore.Domain.Entities.Analytics___Activity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Configurations.Analytics
{
    public class BookViewConfiguration : IEntityTypeConfiguration<BookView>
    {
        public void Configure(EntityTypeBuilder<BookView> builder)
        {
            builder.ToTable("BookViews", "analytics");

            builder.HasKey(bv => bv.Id);

            builder.Property(bv => bv.ViewedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(bv => bv.IpAddress)
                .HasMaxLength(45); // IPv6 max length

            builder.Property(bv => bv.UserAgent)
                .HasMaxLength(500);

            builder.Property(bv => bv.SessionId)
                .HasMaxLength(100);

            // Foreign Keys
            builder.HasOne(bv => bv.Book)
                .WithMany()
                .HasForeignKey(bv => bv.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bv => bv.User)
                .WithMany()
                .HasForeignKey(bv => bv.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for performance
            builder.HasIndex(bv => bv.BookId)
                .HasDatabaseName("IX_BookViews_BookId");

            builder.HasIndex(bv => bv.UserId)
                .HasDatabaseName("IX_BookViews_UserId");

            builder.HasIndex(bv => bv.ViewedAt)
                .HasDatabaseName("IX_BookViews_ViewedAt");

            builder.HasIndex(bv => new { bv.BookId, bv.ViewedAt })
                .HasDatabaseName("IX_BookViews_Book_ViewedAt");
        }
    }
}
