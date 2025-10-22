using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class Permission
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!; // Tên quyền (ví dụ: Read, Write, Delete)
        public string Description { get; set; } = null!; // Mô tả về quyền
        // Quan hệ nhiều-nhiều với Role thông qua RolePermission
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>(); // Danh sách vai trò có quyền này
    }
}
