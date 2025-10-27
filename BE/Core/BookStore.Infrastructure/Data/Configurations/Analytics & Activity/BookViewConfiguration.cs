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

            builder.Property(v => v.IPAddress)
                .HasMaxLength(100);

            builder.Property(v => v.ViewedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 n-1: Book → BookViews
            builder.HasOne(v => v.Book)
                .WithMany()
                .HasForeignKey(v => v.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 n-1: User → BookViews (tùy chọn)
            builder.HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // 📈 Index giúp đếm lượt xem nhanh
            builder.HasIndex(v => new { v.BookId, v.ViewedAt });
        }
    }
}
