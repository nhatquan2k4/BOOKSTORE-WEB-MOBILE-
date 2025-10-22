using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Rental
{
    public class RentalPlanConfiguration : IEntityTypeConfiguration<RentalPlan>
    {
        public void Configure(EntityTypeBuilder<RentalPlan> builder)
        {
            builder.ToTable("RentalPlans", "rental");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.DurationDays)
                .IsRequired();

            builder.Property(p => p.IsActive)
                .HasDefaultValue(true);

            builder.Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-n: RentalPlan → BookRental
            builder.HasMany(p => p.BookRentals)
                .WithOne(r => r.RentalPlan)
                .HasForeignKey(r => r.RentalPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
