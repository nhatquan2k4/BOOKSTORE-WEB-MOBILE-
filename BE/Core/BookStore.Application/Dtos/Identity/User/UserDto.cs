using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.UserManagement
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string IsActive { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserProfileDto? UserProfile { get; set; }
        public List<UserAddressDto> Addresses { get; set; } = new();
        public List<string> Roles { get; set; } = new();
        public List<UserDeviceDto> DeviceDtos { get; set; } = new();


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
