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
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("Roles", "identity");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.HasIndex(r => r.Name).IsUnique();

            builder.Property(r => r.Description)
                .HasMaxLength(255);

            // Seed default roles
            builder.HasData(
                new Role
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Admin",
                    Description = "Administrator with full system access"
                },
                new Role
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "User",
                    Description = "Regular user with basic access"
                },
                new Role
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Shipper",
                    Description = "Delivery personnel with shipping access"
                }
            );
        }
    }
}
