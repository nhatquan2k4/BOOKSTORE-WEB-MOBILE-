using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class UserAddress
    {
        public Guid Id { get; set; }
        public string ReipientName { get; set; } = null!; // Tên người nhận
        public string PhoneNumber { get; set; } = null!; // SDT người nhận
        public string Povince { get; set; } = null!; // Tỉnh/Thành phố
        public string District { get; set; } = null!; // Quận/Huyện
        public string Ward { get; set; } = null!; // Phường/Xã
        public string StreetAddress { get; set; } = null!; // Địa chỉ cụ thể
        public bool IsDefault { get; set; } = false; // co phai Địa chỉ mặc định khong 

        public Guid UserId { get; set; } // Khóa ngoại liên kết đến bảng User
        public virtual User User { get; set; } = null!; // Navigation property đến User
    }
}
