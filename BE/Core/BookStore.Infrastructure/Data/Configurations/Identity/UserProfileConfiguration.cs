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
    public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
    {
        public void Configure(EntityTypeBuilder<UserProfile> builder)
        {
            builder.ToTable("UserProfiles", "identity");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.FullName)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(p => p.Gender)
                .HasMaxLength(20);

            builder.Property(p => p.PhoneNumber)
                .HasMaxLength(20);

            builder.Property(p => p.AvatarUrl)
                .HasMaxLength(500);

            builder.Property(p => p.Bio)
                .HasMaxLength(1000);
        }
    }
}
