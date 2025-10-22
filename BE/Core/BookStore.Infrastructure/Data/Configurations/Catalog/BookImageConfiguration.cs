using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookImageConfiguration : IEntityTypeConfiguration<BookImage>
    {
        public void Configure(EntityTypeBuilder<BookImage> builder)
        {
            builder.ToTable("BookImages", "catalog");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(i => i.IsCover)
                .HasDefaultValue(false);

            builder.Property(i => i.DisplayOrder)
                .HasDefaultValue(0);
        }
    }
}
