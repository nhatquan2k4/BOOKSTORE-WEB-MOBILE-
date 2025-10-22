using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Analytics___Activity
{
    public class AuditLog
    {
        public Guid Id { get; set; }

        public string Action { get; set; } = null!;             // Hành động CRUD (Create, Update, Delete,...)
        public string TableName { get; set; } = null!;          // Bảng bị tác động (Book, Order,...)
        public string? RecordId { get; set; }                   // ID của bản ghi bị tác động
        public string? OldValues { get; set; }                  // JSON chứa giá trị cũ
        public string? NewValues { get; set; }                  // JSON chứa giá trị mới
        public string? ChangedBy { get; set; }                  // Email hoặc ID người thực hiện
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
