using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class UserDevice
    {
        public Guid Id { get; set; } // Khóa chính
        
        public string DeviceName { get; set; } = null!; // Tên thiết bị (ví dụ: iPhone 12, Samsung Galaxy S21)
        public string DeviceType { get; set; } = null!; // Loại thiết bị (ví dụ: Mobile, Tablet, Desktop)
        public string LastLoginIp { get; set; } = null!; // Địa chỉ IP đăng nhập cuối cùng
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow; // Thời gian đăng nhập cuối cùng

        public Guid UserId { get; set; } // Khóa ngoại liên kết đến bảng User
        public virtual User User { get; set; } = null!; // Navigation property đến User
    }
}
