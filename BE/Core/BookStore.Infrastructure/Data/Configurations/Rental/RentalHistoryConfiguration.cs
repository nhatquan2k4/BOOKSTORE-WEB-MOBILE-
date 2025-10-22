using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Rental
{
    public class RentalHistoryConfiguration : IEntityTypeConfiguration<RentalHistory>
    {
        public void Configure(EntityTypeBuilder<RentalHistory> builder)
        {
            builder.ToTable("RentalHistories", "rental");

            builder.HasKey(h => h.Id);

            builder.Property(h => h.Action)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(h => h.Note)
                .HasMaxLength(500);

            builder.Property(h => h.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
