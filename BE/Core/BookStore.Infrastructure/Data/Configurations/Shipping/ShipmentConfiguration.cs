using BookStore.Domain.Entities.Shipping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Shipping
{
    public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
    {
        public void Configure(EntityTypeBuilder<Shipment> builder)
        {
            builder.ToTable("Shipments", "shipping");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.TrackingCode)
                .HasMaxLength(100)
                .IsRequired()
                .HasComment("Mã vận đơn");

            builder.HasIndex(s => s.TrackingCode)
                .IsUnique();

            builder.Property(s => s.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Preparing");

            builder.Property(s => s.Notes)
                .HasMaxLength(500);

            builder.Property(s => s.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 n-1: Shipment → Shipper
            builder.HasOne(s => s.Shipper)
                .WithMany(sh => sh.Shipments)
                .HasForeignKey(s => s.ShipperId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 n-1: Shipment → Order
            builder.HasOne(s => s.Order)
                .WithOne()
                .HasForeignKey<Shipment>(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-n: Shipment → RoutePoints
            builder.HasMany(s => s.RoutePoints)
                .WithOne(p => p.Shipment)
                .HasForeignKey(p => p.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 1-n: Shipment → StatusHistory
            builder.HasMany(s => s.StatusHistory)
                .WithOne(st => st.Shipment)
                .HasForeignKey(st => st.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
