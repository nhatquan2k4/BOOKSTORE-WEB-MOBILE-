using BookStore.Domain.Entities.Cart;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class CartConfiguration : IEntityTypeConfiguration<Domain.Entities.Cart.Cart>
    {
        public void Configure(EntityTypeBuilder<Domain.Entities.Cart.Cart> builder)
        {
            builder.ToTable("Carts", "ordering");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.IsActive)
                .HasDefaultValue(true);

            builder.Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-n: Cart – CartItem
            builder.HasMany(c => c.Items)
                .WithOne(i => i.Cart)
                .HasForeignKey(i => i.CartId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
