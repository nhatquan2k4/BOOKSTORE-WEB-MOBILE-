using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.System
{
    public class Settings
    {
        public Guid Id { get; set; }

        public string Key { get; set; } = null!;                // Tên cài đặt (VD: "MaxLoginAttempts", "EnableRental")
        public string Value { get; set; } = null!;              // Giá trị cấu hình
        public string? Description { get; set; }                // Mô tả ý nghĩa của key
        public bool IsSystem { get; set; } = false;             // true = chỉ Admin mới chỉnh được
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
