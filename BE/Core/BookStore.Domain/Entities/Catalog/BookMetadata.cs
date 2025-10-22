using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookMetadata
    {
        public Guid Id { get; set; }

        public string Key { get; set; } = null!;              // Tên thuộc tính (VD: Trọng lượng, Kích thước,...)
        public string Value { get; set; } = null!;            // Giá trị của thuộc tính

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;
    }
}
