using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class UserProfile
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = null!; // Họ và tên đầy đủ của người dùng
        public DateTime? DateOfBirth { get; set; } // Ngày sinh của người dùng
        public string? Gender { get; set; } // Giới tính của người dùng
        public string? AvatarUrl { get; set; } // URL ảnh đại diện của người dùng
        public string? PhoneNumber { get; set; } // Số điện thoại của người dùng
        public string? Bio { get; set; } // Tiểu sử hoặc mô tả về người dùng

        public Guid UserId { get; set; } // Khóa ngoại liên kết đến bảng User
        public virtual User User { get; set; } = null!; // Navigation property đến User
    }
}
