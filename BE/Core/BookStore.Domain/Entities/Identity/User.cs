using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.Entities.Common;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Rental;
using BookStore.Domain.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class User
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = null!;  // Email duy nhất dùng làm tên đăng nhập
        public string PasswordHash { get; set; } = null!; // Mật khẩu đã được băm
        public bool IsActive { get; set; } = true; // Trạng thái kích hoạt tài khoản
        public DateTime CreateAt { get; set; } = DateTime.UtcNow; // Thời gian tạo tài khoản
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật tài khoản gần nhất

        // Navigation property đến hồ sơ người dùng
        public virtual UserProfile? Profiles { get; set; } // Thông tin hồ sơ người dùng liên quan

        // Quan he 1-n vs UserAddresses
        public virtual ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>(); // Danh sách địa chỉ người dùng

        // 1-n vs UserDevices
        public virtual ICollection<UserDevice> Devices { get; set; } = new List<UserDevice>(); // Danh sách thiết bị người dùng

        // 1-n vs RefreshTokens
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>(); // Danh sách token làm mới

        // 1-n vs Role
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>(); // Danh sách vai trò người dùng

        //Navigation property 
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>(); // Danh sách đơn hàng của người dùng
        public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>(); // Danh sách giỏ hàng của người dùng
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();             // Các đánh giá của người dùng
        public virtual ICollection<BookRental> BookRentals { get; set; } = new List<BookRental>(); // Sách thuê
        public virtual ICollection<UserActivity> Activities { get; set; } = new List<UserActivity>(); // Nhật ký hành động
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>(); // Thông báo
    }

}
