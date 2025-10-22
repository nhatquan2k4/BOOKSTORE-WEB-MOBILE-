using BookStore.Domain.Entities.Pricing___Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.PricingInventory
{
    public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
    {
        public void Configure(EntityTypeBuilder<Discount> builder)
        {
            builder.ToTable("Discounts", "pricing");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.Code)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(d => d.Code).IsUnique();

            builder.Property(d => d.Title)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(d => d.Description)
                .HasMaxLength(1000);

            builder.Property(d => d.Percentage)
                .HasColumnType("decimal(5,2)")
                .IsRequired();

            builder.Property(d => d.MaxDiscountAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(d => d.StartDate)
                .IsRequired();

            builder.Property(d => d.EndDate)
                .IsRequired();

            builder.Property(d => d.IsActive)
                .HasDefaultValue(true);
        }
    }
}
