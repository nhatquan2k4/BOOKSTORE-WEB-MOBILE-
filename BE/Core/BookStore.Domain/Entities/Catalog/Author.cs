using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Author
    {
        public Guid Id { get; set; } // Khóa chính
        public string Name { get; set; } = null!; // Tên tác giả
        public string? Biography { get; set; } // Tiểu sử tác giả
        public string? AvartarUrl { get; set; } // URL ảnh đại diện

        // Navigation property - Một tác giả có thể có nhiều sách
        public virtual ICollection<BookAuthor> BookAuthor { get; set; } = new List<BookAuthor>();
    }
}
