using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookFile
    {
        public Guid Id { get; set; }

        public string FileUrl { get; set; } = null!;          // Link file ebook (PDF, EPUB,...)
        public string FileType { get; set; } = null!;         // Loại file
        public long FileSize { get; set; }                    // Dung lượng file (bytes)
        public bool IsPreview { get; set; }                   // Có phải bản xem thử không

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;
    }
}
