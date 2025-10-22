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
    public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
    {
        public void Configure(EntityTypeBuilder<UserAddress> builder)
        {
            builder.ToTable("UserAddresses", "identity");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.ReipientName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(a => a.Povince)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.District)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.Ward)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.StreetAddress)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(a => a.IsDefault)
                .HasDefaultValue(false);
        }
    }
}
