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

            builder.Property(r => r.Title)
                .HasMaxLength(200)
                .IsRequired(false)
                .HasComment("Tiêu đề đánh giá");

            builder.Property(r => r.Content)
                .HasMaxLength(2000)
                .IsRequired()
                .HasComment("Nội dung đánh giá của người dùng");

            builder.Property(r => r.Status)
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Pending")
                .HasComment("Trạng thái: Pending, Approved, Rejected");

            builder.Property(r => r.IsVerifiedPurchase)
                .HasDefaultValue(false)
                .HasComment("Đã xác thực mua hàng");

            builder.Property(r => r.IsEdited)
                .HasDefaultValue(false);

            builder.Property(r => r.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(r => r.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(r => r.UpdatedAt)
                .IsRequired(false);

            builder.Property(r => r.ApprovedAt)
                .IsRequired(false);

            builder.Property(r => r.ApprovedBy)
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

            // 🔗 n-1: Review → Order (optional)
            builder.HasOne(r => r.Order)
                .WithMany()
                .HasForeignKey(r => r.OrderId)
                .OnDelete(DeleteBehavior.SetNull);

            // 📈 Index để tìm kiếm nhanh
            builder.HasIndex(r => new { r.BookId, r.UserId });
            builder.HasIndex(r => r.Status);
            builder.HasIndex(r => r.BookId);

            // ✅ Soft delete filter (nếu bạn dùng Global Query Filter)
            // builder.HasQueryFilter(r => !r.IsDeleted);
        }
    }
}
