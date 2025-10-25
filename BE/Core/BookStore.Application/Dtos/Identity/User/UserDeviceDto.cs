using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Identity.UserManagement
{
    public class UserDeviceDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string DeviceId { get; set; } = null!;
        public string DeviceType { get; set; } = null!;
        public string? IPAddress { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; }
        
    }

    public class CreateUserDeviceDto
    {
        public string DeviceId { get; set; } = null!;
        public string DeviceType { get; set; } = null!;
        public string DeviceName { get; set; } = null!;
        public string? IPAddress { get; set; }
    }
}
