using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Rental
{
    public class RentalAccessToken
    {
        public Guid Id { get; set; }                               // Khóa chính

        public string Token { get; set; } = null!;                 // Mã truy cập tạm (random UUID hoặc JWT)
        public DateTime Expiration { get; set; }                   // Hết hạn token
        public bool IsRevoked { get; set; } = false;               // Có bị thu hồi không

        public Guid UserId { get; set; }                           // Ai sở hữu token
        public virtual User User { get; set; } = null!;

        public Guid BookRentalId { get; set; }                     // Token thuộc lượt thuê nào
        public virtual BookRental BookRental { get; set; } = null!;

        public string? IPAddress { get; set; }                     // Địa chỉ IP sinh token (theo dõi bảo mật)
        public string? DeviceInfo { get; set; }                    // Thông tin thiết bị phát sinh token
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời điểm tạo token
    }
}
