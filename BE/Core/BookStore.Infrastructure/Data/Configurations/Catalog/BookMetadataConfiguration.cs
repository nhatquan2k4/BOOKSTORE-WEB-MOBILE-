using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookMetadataConfiguration : IEntityTypeConfiguration<BookMetadata>
    {
        public void Configure(EntityTypeBuilder<BookMetadata> builder)
        {
            builder.ToTable("BookMetadata", "catalog");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Key)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(m => m.Value)
                .IsRequired()
                .HasMaxLength(255);
        }
    }
}
