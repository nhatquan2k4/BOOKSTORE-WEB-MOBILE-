using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookFormatConfiguration : IEntityTypeConfiguration<BookFormat>
    {
        public void Configure(EntityTypeBuilder<BookFormat> builder)
        {
            builder.ToTable("BookFormats", "catalog");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.FormatType)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(f => f.Description)
                .HasMaxLength(500);
        }
    }
}
