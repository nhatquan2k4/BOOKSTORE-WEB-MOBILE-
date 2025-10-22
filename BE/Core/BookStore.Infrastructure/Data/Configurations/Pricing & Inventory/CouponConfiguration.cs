using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.PricingInventory
{
    public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
    {
        public void Configure(EntityTypeBuilder<Coupon> builder)
        {
            builder.ToTable("Coupons", "pricing");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Code)
                .HasMaxLength(50)
                .IsRequired();

            builder.HasIndex(c => c.Code).IsUnique();

            builder.Property(c => c.Value)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(c => c.IsPercentage)
                .HasDefaultValue(false);

            builder.Property(c => c.Expiration)
                .IsRequired();

            builder.Property(c => c.IsUsed)
                .HasDefaultValue(false);

            // 🔗 n-1: Coupon – User
            builder.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // 🔗 1-n: Coupon – Order
            builder.HasMany(c => c.Orders)
                .WithOne(o => o.Coupon)
                .HasForeignKey(o => o.CouponId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
