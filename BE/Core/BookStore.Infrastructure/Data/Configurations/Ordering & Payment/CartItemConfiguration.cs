using BookStore.Domain.Entities.Ordering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CartItems", "ordering");

            builder.HasKey(ci => ci.Id);

            builder.Property(ci => ci.Quantity)
                .HasDefaultValue(1);

            builder.Property(ci => ci.UnitPrice)
                .HasColumnType("decimal(18,2)");

            builder.Property(ci => ci.AddedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
