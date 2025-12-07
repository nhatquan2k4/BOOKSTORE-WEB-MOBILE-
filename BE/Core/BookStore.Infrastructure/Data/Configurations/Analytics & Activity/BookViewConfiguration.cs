using BookStore.Domain.Entities.Analytics___Activity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.AnalyticsActivity
{
    public class BookViewsConfiguration : IEntityTypeConfiguration<BookView>
    {
        public void Configure(EntityTypeBuilder<BookView> builder)
        {
            builder.ToTable("BookViews", "analytics");

            builder.HasKey(v => v.Id);

            builder.Property(v => v.IpAddress)
                .HasMaxLength(45)
                .HasComment("IP address of the viewer");

            builder.Property(v => v.UserAgent)
                .HasMaxLength(500)
                .HasComment("Browser/client user agent");

            builder.Property(v => v.SessionId)
                .HasMaxLength(100)
                .HasComment("Session ID for tracking unique sessions");

            builder.Property(v => v.ViewedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Foreign key relationships
            builder.HasOne(v => v.Book)
                .WithMany()
                .HasForeignKey(v => v.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for analytics queries
            builder.HasIndex(v => v.BookId)
                .HasDatabaseName("IX_BookViews_BookId");

            builder.HasIndex(v => v.UserId)
                .HasDatabaseName("IX_BookViews_UserId");

            builder.HasIndex(v => v.ViewedAt)
                .HasDatabaseName("IX_BookViews_ViewedAt");

            builder.HasIndex(v => new { v.BookId, v.ViewedAt })
                .HasDatabaseName("IX_BookViews_BookId_ViewedAt");
        }
    }
}
