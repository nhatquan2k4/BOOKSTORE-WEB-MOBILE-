using BookStore.Application.Dtos.Identity.User;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.User
{

    public static class UserDeviceMapper
    {
        #region UserDevice -> UserDeviceDto
        
        public static UserDeviceDto ToDto(this UserDevice device)
        {
            if (device == null) return null!;

            return new UserDeviceDto
            {
                Id = device.Id,
                UserId = device.UserId,
                DeviceName = device.DeviceName,
                DeviceType = device.DeviceType,
                LastLoginIp = device.LastLoginIp,
                LastLoginAt = device.LastLoginAt
            };
        }

        public static List<UserDeviceDto> ToDtoList(this IEnumerable<UserDevice> devices)
        {
            return devices?.Select(d => d.ToDto()).ToList() ?? new List<UserDeviceDto>();
        }

        #endregion

        #region CreateUserDeviceDto -> UserDevice

        public static UserDevice ToEntity(this CreateUserDeviceDto dto, Guid userId)
        {
            if (dto == null) return null!;

            return new UserDevice
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                DeviceName = dto.DeviceName,
                DeviceType = dto.DeviceType,
                LastLoginIp = dto.LastLoginIp,
                LastLoginAt = DateTime.UtcNow
            };
        }

        #endregion

        #region Update UserDevice

        public static void UpdateLastLogin(this UserDevice device, string ipAddress)
        {
            if (device == null) return;

            device.LastLoginIp = ipAddress;
            device.LastLoginAt = DateTime.UtcNow;
        }

        #endregion
    }
}
