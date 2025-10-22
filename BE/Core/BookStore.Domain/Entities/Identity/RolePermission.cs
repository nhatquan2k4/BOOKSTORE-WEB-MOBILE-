using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class RolePermission
    {
        public Guid RoleId { get; set; } // Khóa ngoại liên kết đến bảng Role
        public virtual Role Role { get; set; } = null!; // Navigation property đến Role
        public Guid PermissionId { get; set; } // Khóa ngoại liên kết đến bảng Permission
        public virtual Permission Permission { get; set; } = null!; // Navigation property đến Permission
    }
}
