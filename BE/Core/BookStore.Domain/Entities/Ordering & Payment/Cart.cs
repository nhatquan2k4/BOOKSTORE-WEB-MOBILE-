using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering
{
    public class Cart
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                       // FK: Giỏ hàng thuộc về người dùng nào
        public virtual User User { get; set; } = null!;

        public bool IsActive { get; set; } = true;             // Giỏ hàng còn hiệu lực không (true = chưa checkout)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 1-n: Giỏ hàng chứa nhiều sản phẩm
        public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();
    }
}
