using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Publisher
    {
        public Guid Id { get; set; } // Khóa chính
        public string Name { get; set; } = null!; // Tên nhà xuất bản
        public string? Address { get; set; } 
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        // Navigation property - Một nhà xuất bản có thể có nhiều sách
        public virtual ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
