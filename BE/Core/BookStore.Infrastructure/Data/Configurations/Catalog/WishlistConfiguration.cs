using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Catalog
{
    public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
    {
        public void Configure(EntityTypeBuilder<Wishlist> builder)
        {
            builder.ToTable("Wishlists", "catalog");

            builder.HasKey(w => w.Id);

            builder.Property(w => w.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Quan hệ với User (Identity)
            builder.HasOne(w => w.User)
                .WithMany(u => u.WishlistItems)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ với Book (Catalog)
            builder.HasOne(w => w.Book)
                .WithMany(b => b.WishlistItems)
                .HasForeignKey(w => w.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index để tăng tốc truy vấn
            builder.HasIndex(w => w.UserId);
            builder.HasIndex(w => w.BookId);

            // Đảm bảo 1 user không thể thêm 1 sách vào wishlist 2 lần
            builder.HasIndex(w => new { w.UserId, w.BookId })
                .IsUnique();
        }
    }
}
