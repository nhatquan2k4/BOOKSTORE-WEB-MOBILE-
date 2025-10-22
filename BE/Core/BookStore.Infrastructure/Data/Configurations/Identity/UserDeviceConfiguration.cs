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
    public class UserDeviceConfiguration : IEntityTypeConfiguration<UserDevice>
    {
        public void Configure(EntityTypeBuilder<UserDevice> builder)
        {
            builder.ToTable("UserDevices", "identity");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.DeviceName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(d => d.DeviceType)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(d => d.LastLoginIp)
                .HasMaxLength(100)
                .IsRequired();
        }
    }
}
