using BookStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.System
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications", "system");

            builder.HasKey(n => n.Id);

            builder.Property(n => n.Title)
                .HasMaxLength(150)
                .IsRequired()
                .HasComment("Tiêu đề của thông báo");

            builder.Property(n => n.Message)
                .HasMaxLength(1000)
                .IsRequired()
                .HasComment("Nội dung chi tiết của thông báo");

            builder.Property(n => n.Type)
                .HasMaxLength(50)
                .HasComment("Loại thông báo (Order, System, Promotion,...)");

            builder.Property(n => n.IsRead)
                .HasDefaultValue(false);

            builder.Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(n => n.Link)
                .HasMaxLength(255)
                .HasComment("Đường dẫn điều hướng (VD: /order/123)");

            // 🔗 n-1: User → Notifications
            builder.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 📈 Index để truy vấn nhanh
            builder.HasIndex(n => new { n.UserId, n.IsRead });
        }
    }
}
