using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.Dtos.Identity.Role;
using BookStore.Application.IService.Identity.User;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.Mappers.Identity.User;
using BookStore.Application.Mappers.Identity.RolePermission;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Services.Identity.User
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly IUserProfileRepository _userProfileRepository;

        public UserService(
            IUserRepository userRepository,
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IPasswordService passwordService,
            IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(u => u.ToDto());
        }

        public async Task<UserDto?> GetByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdWithAllDetailsAsync(id);
            return user?.ToDto();
        }

        public async Task<UserDto> AddAsync(CreateUserDto dto)
        {
            if (await _userRepository.ExistsByEmailAsync(dto.Email))
                throw new InvalidOperationException("Email đã tồn tại");

            var user = dto.ToEntity();
            user.PasswordHash = _passwordService.HashPassword(dto.Password);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            if (dto.RoleIds != null && dto.RoleIds.Any())
            {
                await AssignRolesToUserAsync(user.Id, dto.RoleIds);
            }

            return (await _userRepository.GetByIdWithAllDetailsAsync(user.Id))!.ToDto();
        }

        public async Task<UserDto> UpdateAsync(UpdateUserDto dto)
        {
            throw new NotImplementedException("Update cần userId, hãy dùng UpdateUserAsync");
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return false;

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null;
        }

        public async Task SaveChangesAsync()
        {
            await _userRepository.SaveChangesAsync();
        }

        public async Task<(IEnumerable<UserSummaryDto> Users, int TotalCount)> GetPagedUsersAsync(
            int pageNumber, int pageSize, string? searchTerm = null)
        {
            var (users, totalCount) = await _userRepository.GetPagedAsync(pageNumber, pageSize, searchTerm);
            var userSummaries = users.Select(u => u.ToSummaryDto());
            return (userSummaries, totalCount);
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            return user?.ToDto();
        }

        public async Task<bool> ActivateUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RoleDto>> GetUserRolesAsync(Guid userId)
        {
            var roles = await _roleRepository.GetRolesByUserIdAsync(userId);
            return roles.Select(r => r.ToDto());
        }

        public async Task<bool> AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            var userExists = await _userRepository.GetByIdAsync(userId) != null;
            var roleExists = await _roleRepository.GetByIdAsync(roleId) != null;

            if (!userExists || !roleExists) return false;

            if (await _userRoleRepository.ExistsAsync(userId, roleId))
                return false;

            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = roleId
            };

            await _userRoleRepository.AddAsync(userRole);
            await _userRoleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, Guid roleId)
        {
            if (!await _userRoleRepository.ExistsAsync(userId, roleId))
                return false;

            await _userRoleRepository.RemoveAsync(userId, roleId);
            await _userRoleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignRolesToUserAsync(Guid userId, List<Guid> roleIds)
        {
            var userExists = await _userRepository.GetByIdAsync(userId) != null;
            if (!userExists) return false;

            await _userRoleRepository.RemoveAllByUserIdAsync(userId);

            var userRoles = roleIds.Select(roleId => new UserRole
            {
                UserId = userId,
                RoleId = roleId
            });

            await _userRoleRepository.AddRangeAsync(userRoles);
            await _userRoleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId)
        {
            return await _userRepository.GetUserPermissionNamesAsync(userId);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.ExistsByEmailAsync(email);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!_passwordService.VerifyPassword(currentPassword, user.PasswordHash))
                return false;

            var newPasswordHash = _passwordService.HashPassword(newPassword);
            return await _userRepository.UpdatePasswordAsync(userId, newPasswordHash);
        }
    }
}
