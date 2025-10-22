using BookStore.Domain.Entities.Ordering;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
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
