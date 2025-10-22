using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookImage
    {
        public Guid Id { get; set; }

        public string ImageUrl { get; set; } = null!;         // Đường dẫn ảnh lưu trên S3/MinIO
        public bool IsCover { get; set; }                     // Ảnh này có phải bìa chính không
        public int DisplayOrder { get; set; }                 // Thứ tự hiển thị ảnh

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;
    }
}
