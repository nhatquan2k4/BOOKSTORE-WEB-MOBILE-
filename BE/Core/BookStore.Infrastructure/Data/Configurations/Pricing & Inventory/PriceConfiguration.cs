using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.PricingInventory
{
    public class PriceConfiguration : IEntityTypeConfiguration<Price>
    {
        public void Configure(EntityTypeBuilder<Price> builder)
        {
            builder.ToTable("Prices", "pricing");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND");

            builder.Property(p => p.IsCurrent)
                .HasDefaultValue(true);

            builder.Property(p => p.EffectiveFrom)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-n: Price – Book
            builder.HasOne(p => p.Book)
                .WithMany(b => b.Prices)
                .HasForeignKey(p => p.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 n-1: Price – Discount
            builder.HasOne(p => p.Discount)
                .WithMany(d => d.Prices)
                .HasForeignKey(p => p.DiscountId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
