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

            builder.Property(p => p.PlanType)
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("SingleBook")
                .HasComment("Loại gói: Subscription (đọc tất cả) hoặc SingleBook (thuê từng quyển)");

            builder.Property(p => p.IsActive)
                .HasDefaultValue(true);

            builder.Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Index cho PlanType để query nhanh
            builder.HasIndex(p => p.PlanType);

            // 🔗 1-n: RentalPlan → BookRental
            builder.HasMany(p => p.BookRentals)
                .WithOne(r => r.RentalPlan)
                .HasForeignKey(r => r.RentalPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
