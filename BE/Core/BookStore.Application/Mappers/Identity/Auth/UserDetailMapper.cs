using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.Mappers.Identity.User;

using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.Auth
{
    /// Mapper phức tạp cho User với đầy đủ thông tin (Profile, Addresses, Roles, Devices)
    public static class UserDetailMapper
    {
        /// Chuyển User entity sang UserDetailDto với đầy đủ thông tin
        /// Dùng khi: Cần hiển thị thông tin chi tiết đầy đủ của user
        /// Bao gồm: UserProfile, UserAddresses, UserRoles, UserDevices
        public static UserDetailDto ToDetailDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null!;

            return new UserDetailDto
            {
                // Thông tin cơ bản
                Id = user.Id,
                Email = user.Email,
                IsActive = user.IsActive,
                CreateAt = user.CreateAt,
                UpdatedAt = user.UpdatedAt,

                // Thông tin Profile (1-1)
                Profile = user.Profiles?.ToDto(),

                // Danh sách Addresses (1-n)
                Addresses = user.Addresses?
                    .Select(a => a.ToDto())
                    .ToList() ?? new List<UserAddressDto>(),

                // Danh sách Roles (n-n through UserRole)
                Roles = user.UserRoles?
                    .Select(ur => new UserRoleDetailDto
                    {
                        RoleId = ur.RoleId,
                        RoleName = ur.Role?.Name ?? string.Empty,
                        RoleDescription = ur.Role?.Description,
                        Permissions = ur.Role?.RolePermissions?
                            .Select(rp => new PermissionDetailDto
                            {
                                PermissionId = rp.PermissionId,
                                PermissionName = rp.Permission?.Name ?? string.Empty,
                                PermissionDescription = rp.Permission?.Description
                            })
                            .ToList() ?? new List<PermissionDetailDto>()
                    })
                    .ToList() ?? new List<UserRoleDetailDto>(),

                // Danh sách Devices (1-n)
                Devices = user.Devices?
                    .Select(d => d.ToDto())
                    .ToList() ?? new List<UserDeviceDto>(),

                // Thống kê
                TotalAddresses = user.Addresses?.Count ?? 0,
                TotalRoles = user.UserRoles?.Count ?? 0,
                TotalDevices = user.Devices?.Count ?? 0,
                TotalPermissions = user.UserRoles?
                    .SelectMany(ur => ur.Role?.RolePermissions ?? new List<Domain.Entities.Identity.RolePermission>())
                    .Select(rp => rp.PermissionId)
                    .Distinct()
                    .Count() ?? 0
            };
        }

        /// Chuyển danh sách User sang danh sách UserDetailDto

        public static List<UserDetailDto> ToDetailDtoList(this IEnumerable<Domain.Entities.Identity.User> users)
        {
            return users?.Select(u => u.ToDetailDto()).ToList() ?? new List<UserDetailDto>();
        }
    }

    #region Supporting DTOs

    /// DTO chi tiết cho User bao gồm tất cả thông tin
    public class UserDetailDto
    {
        // Thông tin cơ bản
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Thông tin chi tiết
        public UserProfileDto? Profile { get; set; }
        public List<UserAddressDto> Addresses { get; set; } = new();
        public List<UserRoleDetailDto> Roles { get; set; } = new();
        public List<UserDeviceDto> Devices { get; set; } = new();

        // Thống kê
        public int TotalAddresses { get; set; }
        public int TotalRoles { get; set; }
        public int TotalDevices { get; set; }
        public int TotalPermissions { get; set; }
    }

    /// DTO chi tiết cho Role trong UserDetail (bao gồm permissions)
    public class UserRoleDetailDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public string? RoleDescription { get; set; }
        public List<PermissionDetailDto> Permissions { get; set; } = new();
    }
    /// DTO chi tiết cho Permission trong UserDetail

    public class PermissionDetailDto
    {
        public Guid PermissionId { get; set; }
        public string PermissionName { get; set; } = null!;
        public string? PermissionDescription { get; set; }
    }

    #endregion
}
