
using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.Dtos.Identity.Role;

namespace BookStore.Application.IService.Identity.User
{
    public interface IUserService : IGenericService<UserDto, CreateUserDto, UpdateUserDto>
    {
        Task<(IEnumerable<UserSummaryDto> Users, int TotalCount)> GetPagedUsersAsync(int pageNumber, int pageSize, string? searchTerm = null);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<bool> ActivateUserAsync(Guid userId);
        Task<bool> DeactivateUserAsync(Guid userId);
        Task<IEnumerable<RoleDto>> GetUserRolesAsync(Guid userId);
        Task<bool> AssignRoleToUserAsync(Guid userId, Guid roleId);
        Task<bool> RemoveRoleFromUserAsync(Guid userId, Guid roleId);
        Task<bool> AssignRolesToUserAsync(Guid userId, List<Guid> roleIds);
        Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    }
}
