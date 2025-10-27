using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Configurations.Pricing_Inventory
{
    public class InvenTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
    {
        public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
        {
            builder.ToTable("InventoryTransactions");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.QuantityChange)
                   .IsRequired();

            builder.Property(x => x.Type)
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .IsRequired();

            builder.Property(x => x.ReferenceId)
                   .HasMaxLength(100);

            builder.Property(x => x.Note)
                   .HasMaxLength(1000);

            // FK đến Warehouse
            builder.HasOne(x => x.Warehouse)
                   .WithMany()
                   .HasForeignKey(x => x.WarehouseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // FK đến Book
            builder.HasOne(x => x.Book)
                   .WithMany()
                   .HasForeignKey(x => x.BookId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Index phục vụ báo cáo / thống kê
            builder.HasIndex(x => new { x.WarehouseId, x.BookId, x.CreatedAt });
        }
    }
}
