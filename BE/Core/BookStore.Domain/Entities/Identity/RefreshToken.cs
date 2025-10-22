using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class RefreshToken
    {
        public Guid Id { get; set; } // Khóa chính

        public string Token { get; set; } = null!; // Mã token làm mới
        public DateTime ExpiryDate { get; set; } // Thời gian hết hạn của token
        public bool IsRevoked { get; set; } = false; // Trạng thái token có bị thu hồi hay không

        public Guid UserId { get; set; } // Khóa ngoại liên kết đến bảng User
        public virtual User User { get; set; } = null!; // Navigation property đến User
    }
}
