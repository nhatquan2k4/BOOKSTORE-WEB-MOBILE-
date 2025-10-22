using BookStore.Domain.Entities.Shipping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Shipping
{
    public class ShipmentRoutePointConfiguration : IEntityTypeConfiguration<ShipmentRoutePoint>
    {
        public void Configure(EntityTypeBuilder<ShipmentRoutePoint> builder)
        {
            builder.ToTable("ShipmentRoutePoints", "shipping");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Location)
                .HasMaxLength(200)
                .IsRequired()
                .HasComment("Tên vị trí cụ thể (ví dụ: Kho HCM, Bưu cục Gò Vấp)");

            builder.Property(p => p.Status)
                .HasMaxLength(50)
                .HasDefaultValue("InTransit");

            builder.Property(p => p.Note)
                .HasMaxLength(500);

            builder.Property(p => p.Timestamp)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
