using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders", "ordering");

            builder.HasKey(o => o.Id);

            builder.Property(o => o.OrderNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(o => o.OrderNumber).IsUnique();

            builder.Property(o => o.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(o => o.DiscountAmount)
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0);

            builder.Property(o => o.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-n: Order – OrderItem
            builder.HasMany(o => o.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-n: Order – OrderStatusLog
            builder.HasMany(o => o.StatusLogs)
                .WithOne(s => s.Order)
                .HasForeignKey(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-n: Order – OrderHistory
            builder.HasMany(o => o.Histories)
                .WithOne(h => h.Order)
                .HasForeignKey(h => h.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-1: Order – OrderAddress
            builder.HasOne(o => o.Address)
                .WithOne(a => a.Order)
                .HasForeignKey<Order>(o => o.AddressId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 1-1: Order – PaymentTransaction
            builder.HasOne(o => o.PaymentTransaction)
                .WithOne(p => p.Order)
                .HasForeignKey<PaymentTransaction>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
