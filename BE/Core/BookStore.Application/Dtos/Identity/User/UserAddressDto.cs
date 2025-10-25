using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.UserManagement
{
    public class UserAddressDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string RecipientName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string StreetAddress { get; set; } = null!;
        public string Ward { get; set; } = null!;
        public string District { get; set; } = null!;
        public string Province { get; set; } = null!;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateUserAddressDto
    {
        public string RecipientName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string StreetAddress { get; set; } = null!;
        public string Ward { get; set; } = null!;
        public string District { get; set; } = null!;
        public string Province { get; set; } = null!;
        public bool IsDefault { get; set; } = false;
    }

    public class UpdateUserAddressDto
    {
        public string? RecipientName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? StreetAddress { get; set; }
        public string? Ward { get; set; }
        public string? District { get; set; }
        public string? Province { get; set; }
        public bool? IsDefault { get; set; }
    }
}
