using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Analytics___Activity
{
    public class BookView
    {
        public Guid Id { get; set; }

        public Guid BookId { get; set; }                        // FK: Sách được xem
        public virtual Book Book { get; set; } = null!;

        public Guid? UserId { get; set; }                       // Nếu là user đã đăng nhập
        public virtual User? User { get; set; }

        public string? IPAddress { get; set; }                  // IP người xem (cho người không đăng nhập)
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
//Giải thích:
//Dùng để đếm lượt xem sách, xác định sách hot hoặc được quan tâm nhiều nhất.
//Cũng có thể dùng để gợi ý đề xuất (“người xem sách này cũng xem…”).