using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class RefundConfiguration : IEntityTypeConfiguration<Refund>
    {
        public void Configure(EntityTypeBuilder<Refund> builder)
        {
            builder.ToTable("Refunds", "ordering");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Amount)
                .HasColumnType("decimal(18,2)");

            builder.Property(r => r.Reason)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(r => r.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
        }
    }
}
