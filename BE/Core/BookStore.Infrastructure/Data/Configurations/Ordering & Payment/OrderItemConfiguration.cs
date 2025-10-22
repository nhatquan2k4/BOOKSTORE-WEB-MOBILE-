using BookStore.Domain.Entities.Ordering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems", "ordering");

            builder.HasKey(oi => oi.Id);

            builder.Property(oi => oi.Quantity)
                .HasDefaultValue(1);

            builder.Property(oi => oi.UnitPrice)
                .HasColumnType("decimal(18,2)");
        }
    }
}
