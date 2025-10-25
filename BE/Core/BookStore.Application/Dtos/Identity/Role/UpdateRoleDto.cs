using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.Role
{
    public class UpdateRoleDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
        public bool IsActive { get; set; }
    }

}
