using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class BookAuthorConfiguration : IEntityTypeConfiguration<BookAuthor>
    {
        public void Configure(EntityTypeBuilder<BookAuthor> builder)
        {
            builder.ToTable("BookAuthors", "catalog");

            builder.HasKey(ba => new { ba.BookId, ba.AuthorId });

            builder.HasOne(ba => ba.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(ba => ba.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ba => ba.Author)
                .WithMany(a => a.BookAuthor)
                .HasForeignKey(ba => ba.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
