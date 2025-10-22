using BookStore.Domain.Entities.Shipping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Shipping
{
    public class ShipperConfiguration : IEntityTypeConfiguration<Shipper>
    {
        public void Configure(EntityTypeBuilder<Shipper> builder)
        {
            builder.ToTable("Shippers", "shipping");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                .HasMaxLength(150)
                .IsRequired()
                .HasComment("Tên shipper hoặc tên công ty vận chuyển");

            builder.Property(s => s.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(s => s.Email)
                .HasMaxLength(150);

            builder.Property(s => s.VehicleNumber)
                .HasMaxLength(50);

            builder.Property(s => s.IsActive)
                .HasDefaultValue(true);

            // 🔗 1-n: Shipper → Shipments
            builder.HasMany(s => s.Shipments)
                .WithOne(sh => sh.Shipper)
                .HasForeignKey(sh => sh.ShipperId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
