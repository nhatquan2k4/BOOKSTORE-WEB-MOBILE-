using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookFileConfiguration : IEntityTypeConfiguration<BookFile>
    {
        public void Configure(EntityTypeBuilder<BookFile> builder)
        {
            builder.ToTable("BookFiles", "catalog");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.FileUrl)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(f => f.FileType)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(f => f.FileSize)
                .HasDefaultValue(0);

            builder.Property(f => f.IsPreview)
                .HasDefaultValue(false);
        }
    }
}
