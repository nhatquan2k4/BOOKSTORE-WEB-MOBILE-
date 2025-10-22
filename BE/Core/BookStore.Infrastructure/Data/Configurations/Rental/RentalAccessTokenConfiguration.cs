using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Rental
{
    public class RentalAccessTokenConfiguration : IEntityTypeConfiguration<RentalAccessToken>
    {
        public void Configure(EntityTypeBuilder<RentalAccessToken> builder)
        {
            builder.ToTable("RentalAccessTokens", "rental");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Token)
                .HasMaxLength(255)
                .IsRequired();

            builder.HasIndex(t => t.Token).IsUnique();

            builder.Property(t => t.Expiration)
                .IsRequired();

            builder.Property(t => t.IsRevoked)
                .HasDefaultValue(false);

            builder.Property(t => t.IPAddress)
                .HasMaxLength(100);

            builder.Property(t => t.DeviceInfo)
                .HasMaxLength(255);

            builder.Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 n-1: User → RentalAccessTokens
            builder.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict); // ✅ tránh multiple cascade paths

            // 🔗 n-1: BookRental → RentalAccessTokens
            builder.HasOne(t => t.BookRental)
                .WithMany()
                .HasForeignKey(t => t.BookRentalId)
                .OnDelete(DeleteBehavior.Cascade); // ✅ giữ cascade khi xóa BookRental
        }
    }
}
