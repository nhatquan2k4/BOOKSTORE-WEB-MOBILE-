using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookFormat
    {
        public Guid Id { get; set; }

        public string FormatType { get; set; } = null!;       // Loại định dạng: Paperback, Hardcover, Ebook
        public string? Description { get; set; }              // Mô tả thêm

        // 🔗 1-n: Một định dạng có thể áp dụng cho nhiều sách
        public virtual ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
