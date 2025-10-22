using BookStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Data.Configurations.Identity
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens", "identity");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Token)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(t => t.ExpiryDate)
                .IsRequired();

            builder.Property(t => t.IsRevoked)
                .HasDefaultValue(false);
        }
    }
}
