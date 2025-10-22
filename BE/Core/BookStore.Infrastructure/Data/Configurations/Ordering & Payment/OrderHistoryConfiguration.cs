using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class OrderHistoryConfiguration : IEntityTypeConfiguration<OrderHistory>
    {
        public void Configure(EntityTypeBuilder<OrderHistory> builder)
        {
            builder.ToTable("OrderHistories", "ordering");

            builder.HasKey(h => h.Id);

            builder.Property(h => h.Action)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(h => h.Details)
                .HasMaxLength(1000);
        }
    }
}
