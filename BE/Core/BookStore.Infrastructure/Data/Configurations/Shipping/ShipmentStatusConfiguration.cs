using BookStore.Domain.Entities.Shipping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Shipping
{
    public class ShipmentStatusConfiguration : IEntityTypeConfiguration<ShipmentStatus>
    {
        public void Configure(EntityTypeBuilder<ShipmentStatus> builder)
        {
            builder.ToTable("ShipmentStatuses", "shipping");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Status)
                .HasMaxLength(50)
                .IsRequired()
                .HasComment("Trạng thái vận đơn: Preparing, InTransit, Delivered...");

            builder.Property(s => s.Description)
                .HasMaxLength(500);

            builder.Property(s => s.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.UpdatedBy)
                .HasMaxLength(100);
        }
    }
}
