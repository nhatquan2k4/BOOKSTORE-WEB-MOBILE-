using BookStore.Domain.Entities.Analytics___Activity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.AnalyticsActivity
{
    public class UserActivityConfiguration : IEntityTypeConfiguration<UserActivity>
    {
        public void Configure(EntityTypeBuilder<UserActivity> builder)
        {
            builder.ToTable("UserActivities", "analytics");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Action)
                .HasMaxLength(100)
                .IsRequired()
                .HasComment("Hành động của người dùng: Login, AddToCart, Purchase,...");

            builder.Property(a => a.Description)
                .HasMaxLength(500);

            builder.Property(a => a.IPAddress)
                .HasMaxLength(100);

            builder.Property(a => a.DeviceInfo)
                .HasMaxLength(200);

            builder.Property(a => a.Timestamp)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(a => a.RelatedEntityType)
                .HasMaxLength(100);

            // 🔗 n-1: User → UserActivities
            builder.HasOne(a => a.User)
                .WithMany(u => u.Activities)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 📈 Index giúp thống kê nhanh
            builder.HasIndex(a => new { a.UserId, a.Timestamp });
        }
    }
}
