using BookStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Identity
{
    public class EmailVerificationTokenConfiguration : IEntityTypeConfiguration<EmailVerificationToken>
    {
        public void Configure(EntityTypeBuilder<EmailVerificationToken> builder)
        {
            builder.ToTable("EmailVerificationTokens", "identity");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Token)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(t => t.ExpiryDate)
                .IsRequired();

            builder.Property(t => t.IsUsed)
                .HasDefaultValue(false);

            builder.Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Index để tăng tốc truy vấn
            builder.HasIndex(t => t.Token);
            builder.HasIndex(t => t.UserId);
            builder.HasIndex(t => t.ExpiryDate);
        }
    }
}
