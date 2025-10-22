using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Identity
{
    public class UserRole
    {
        public Guid UserId { get; set; } // Khóa ngoại liên kết đến bảng User
        public virtual User User { get; set; } = null!; // Navigation property đến User
        public Guid RoleId { get; set; } // Khóa ngoại liên kết đến bảng Role
        public virtual Role Role { get; set; } = null!; // Navigation property đến Role
    }
}
