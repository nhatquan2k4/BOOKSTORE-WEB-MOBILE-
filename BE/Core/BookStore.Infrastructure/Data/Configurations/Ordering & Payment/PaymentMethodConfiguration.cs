using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
    {
        public void Configure(EntityTypeBuilder<PaymentMethod> builder)
        {
            builder.ToTable("PaymentMethods", "ordering");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.IsActive)
                .HasDefaultValue(true);
        }
    }
}
