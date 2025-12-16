using BookStore.Domain.Entities.Identity;
using System;

namespace BookStore.Domain.Entities.Catalog
{
    public class Wishlist
    {
        public Guid Id { get; set; }

        // Foreign Key: Người dùng
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        // Foreign Key: Sách được yêu thích
        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        // Thời gian thêm vào wishlist
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
