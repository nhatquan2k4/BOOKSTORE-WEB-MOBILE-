using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookConfiguration : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.ToTable("Books", "catalog");

            builder.HasKey(b => b.Id);

            builder.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(b => b.ISBN)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(b => b.ISBN).IsUnique();

            builder.Property(b => b.Description)
                .HasMaxLength(4000);

            builder.Property(b => b.Language)
                .HasMaxLength(10)
                .HasDefaultValue("vi");

            builder.Property(b => b.Edition)
                .HasMaxLength(50);

            builder.Property(b => b.PageCount)
                .HasDefaultValue(0);

            //  Mối quan hệ 1-n với Publisher
            builder.HasOne(b => b.Publisher)
                .WithMany(p => p.Books)
                .HasForeignKey(b => b.PublisherId)
                .OnDelete(DeleteBehavior.Restrict);

            //  n-n với Author thông qua BookAuthor
            builder.HasMany(b => b.BookAuthors)
                .WithOne(ba => ba.Book)
                .HasForeignKey(ba => ba.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            //  n-n với Category thông qua BookCategory
            builder.HasMany(b => b.BookCategories)
                .WithOne(bc => bc.Book)
                .HasForeignKey(bc => bc.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            //  1-n với BookImage
            builder.HasMany(b => b.Images)
                .WithOne(i => i.Book)
                .HasForeignKey(i => i.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            //  1-n với BookFile
            builder.HasMany(b => b.Files)
                .WithOne(f => f.Book)
                .HasForeignKey(f => f.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            //  1-n với BookMetadata
            builder.HasMany(b => b.Metadata)
                .WithOne(m => m.Book)
                .HasForeignKey(m => m.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
