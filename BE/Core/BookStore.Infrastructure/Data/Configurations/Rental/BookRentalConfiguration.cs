using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Rental
{
    public class BookRentalConfiguration : IEntityTypeConfiguration<BookRental>
    {
        public void Configure(EntityTypeBuilder<BookRental> builder)
        {
            builder.ToTable("BookRentals", "rental");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active");

            builder.Property(r => r.IsReturned)
                .HasDefaultValue(false);

            builder.Property(r => r.IsRenewed)
                .HasDefaultValue(false);

            builder.Property(r => r.StartDate)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(r => r.EndDate)
                .IsRequired();

            // 🔗 1-n: BookRental → RentalHistory
            builder.HasMany(r => r.Histories)
                .WithOne(h => h.BookRental)
                .HasForeignKey(h => h.BookRentalId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 n-1: RentalPlan – BookRental
            builder.HasOne(r => r.RentalPlan)
                .WithMany(p => p.BookRentals)
                .HasForeignKey(r => r.RentalPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
