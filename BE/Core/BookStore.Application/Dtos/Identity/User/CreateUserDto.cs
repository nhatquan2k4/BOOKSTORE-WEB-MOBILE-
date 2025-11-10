using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.User
{
    public class CreateUserDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public CreateUserProfileDto Profile { get; set; } = null!;
        // public List<Guid>? RoleIds { get; set; }

    }

    public class CreateUserProfileDto
    {
        public string FullName { get; set; } = null!;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
    }
}
