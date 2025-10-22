using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class OrderAddressConfiguration : IEntityTypeConfiguration<OrderAddress>
    {
        public void Configure(EntityTypeBuilder<OrderAddress> builder)
        {
            builder.ToTable("OrderAddresses", "ordering");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.RecipientName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(a => a.Province)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.District)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.Ward)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.Street)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(a => a.Note)
                .HasMaxLength(500);
        }
    }
}
