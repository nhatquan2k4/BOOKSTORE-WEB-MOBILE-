using BookStore.Domain.Entities.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Common
{
    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.ToTable("Reviews", "common");

            // 🔑 Khóa chính
            builder.HasKey(r => r.Id);

            // ⭐ Thuộc tính chính
            builder.Property(r => r.Rating)
                .IsRequired()
                .HasComment("Điểm đánh giá từ 1–5 sao");

            builder.Property(r => r.Comment)
                .HasMaxLength(2000)
                .IsRequired()
                .HasComment("Nội dung đánh giá của người dùng");

            builder.Property(r => r.IsEdited)
                .HasDefaultValue(false);

            builder.Property(r => r.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(r => r.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(r => r.UpdatedAt)
                .IsRequired(false);

            // 🔗 1-n: User → Reviews
            builder.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-n: Book → Reviews
            builder.HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // 📈 Index để tìm kiếm nhanh
            builder.HasIndex(r => new { r.BookId, r.UserId });

            // ✅ Soft delete filter (nếu bạn dùng Global Query Filter)
            // builder.HasQueryFilter(r => !r.IsDeleted);
        }
    }
}
