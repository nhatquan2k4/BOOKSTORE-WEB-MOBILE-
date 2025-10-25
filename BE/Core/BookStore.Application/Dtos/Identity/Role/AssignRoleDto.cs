using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.Role
{
    public class AssignRoleDto
    {
        public Guid Id { get; set; }    
        public List<Guid> RoleIds { get; set; } = new();
    }
    public class AssignRoleResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = null!;
        public List<Guid> AssignedRoles { get; set; } = new();
        public List<Guid> FailedRoles { get; set; } = new();
    }
    public class RemoveRole
    {
        public Guid UserId { get; set; }
        public List<Guid> RoleIds { get; set; } = new();
    }
}
