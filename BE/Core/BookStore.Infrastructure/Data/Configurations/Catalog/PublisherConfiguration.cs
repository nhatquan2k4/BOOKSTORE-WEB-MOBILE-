using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class PublisherConfiguration : IEntityTypeConfiguration<Publisher>
    {
        public void Configure(EntityTypeBuilder<Publisher> builder)
        {
            builder.ToTable("Publishers", "catalog");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.Address)
                .HasMaxLength(255);

            builder.Property(p => p.Email)
                .HasMaxLength(150);

            builder.Property(p => p.PhoneNumber)
                .HasMaxLength(20);
        }
    }
}
