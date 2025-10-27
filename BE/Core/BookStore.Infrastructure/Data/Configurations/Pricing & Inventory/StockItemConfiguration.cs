using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Configurations.Pricing_Inventory
{
    public class StockItemConfiguration : IEntityTypeConfiguration<StockItem>
    {
        public void Configure(EntityTypeBuilder<StockItem> builder)
        {
            builder.ToTable("StockItems");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.QuantityOnHand)
                   .IsRequired();

            builder.Property(x => x.ReservedQuantity)
                   .IsRequired();

            builder.Property(x => x.SoldQuantity)
                   .IsRequired();

            builder.Property(x => x.LastUpdated)
                   .IsRequired();

            // Quan hệ với Book (Catalog)
            builder.HasOne(x => x.Book)
                   .WithMany() // không cần navigation ngược từ Book
                   .HasForeignKey(x => x.BookId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với Warehouse
            builder.HasOne<Warehouse>()
                   .WithMany(w => w.StockItems)
                   .HasForeignKey(x => x.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Index để tăng tốc truy vấn theo kho + sách
            builder.HasIndex(x => new { x.WarehouseId, x.BookId })
                   .IsUnique();
        }
    }
}
