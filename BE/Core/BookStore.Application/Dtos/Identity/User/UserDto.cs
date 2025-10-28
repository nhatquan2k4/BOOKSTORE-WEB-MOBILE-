using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public DateTime CreateAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserProfileDto? Profiles { get; set; }
        public List<UserAddressDto> Addresses { get; set; } = new();
        public List<string> Roles { get; set; } = new();
        public List<UserDeviceDto> Devices { get; set; } = new();
    }
    public class UserSummaryDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreateAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }
    
}
