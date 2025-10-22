using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookAuthor
    {
        public Guid BookId { get; set; } // Khóa ngoại liên kết đến bảng Book
        public virtual Book Book { get; set; } = null!; // Navigation property đến Book
        public Guid AuthorId { get; set; } // Khóa ngoại liên kết đến bảng Author
        public virtual Author Author { get; set; } = null!; // Navigation property đến Author
    }
}
