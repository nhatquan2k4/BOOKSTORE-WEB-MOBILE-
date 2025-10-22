using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.PricingInventory
{
    public class StockItemConfiguration : IEntityTypeConfiguration<StockItem>
    {
        public void Configure(EntityTypeBuilder<StockItem> builder)
        {
            builder.ToTable("StockItems", "inventory");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Quantity)
                .HasDefaultValue(0);

            builder.Property(s => s.Reserved)
                .HasDefaultValue(0);

            builder.Property(s => s.Sold)
                .HasDefaultValue(0);

            builder.Property(s => s.LastUpdated)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-1: StockItem – Book
            builder.HasOne(s => s.Book)
                .WithOne(b => b.StockItem)
                .HasForeignKey<StockItem>(s => s.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
