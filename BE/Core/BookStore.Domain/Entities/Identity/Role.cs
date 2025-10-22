using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!; // Tên vai trò (ví dụ: Admin, User, Moderator)
        public string Description { get; set; } = null!; // Mô tả về vai trò
        // Quan hệ nhiều-nhiều với User thông qua UserRole
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>(); // Danh sách người dùng có vai trò này
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>(); // Danh sách quyền của vai trò này
    }
}
