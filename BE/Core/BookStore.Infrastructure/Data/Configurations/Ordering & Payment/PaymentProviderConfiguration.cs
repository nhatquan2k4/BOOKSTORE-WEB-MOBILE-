using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class PaymentProviderConfiguration : IEntityTypeConfiguration<PaymentProvider>
    {
        public void Configure(EntityTypeBuilder<PaymentProvider> builder)
        {
            builder.ToTable("PaymentProviders", "ordering");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(p => p.ApiUrl)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(p => p.PublicKey)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(p => p.SecretKey)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(p => p.IsSandbox)
                .HasDefaultValue(true);
        }
    }
}
