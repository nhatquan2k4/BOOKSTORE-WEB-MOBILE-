using BookStore.Application.Dtos.Identity.Role;
using BookStore.Application.IService.Identity.Role;
using BookStore.Application.Mappers.Identity.RolePermission;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Services.Identity.Role
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public RoleService(
            IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            IRolePermissionRepository rolePermissionRepository)
        {
            _roleRepository = roleRepository;
            _permissionRepository = permissionRepository;
            _rolePermissionRepository = rolePermissionRepository;
        }

        public async Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            return roles.Select(r => r.ToDto());
        }

        public async Task<RoleDto?> GetByIdAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdWithPermissionsAsync(id);
            return role?.ToDto();
        }

        public async Task<RoleDto> AddAsync(CreateRoleDto dto)
        {
            if (await _roleRepository.ExistsByNameAsync(dto.Name))
                throw new InvalidOperationException("Tên role đã tồn tại");

            var role = dto.ToEntity();
            await _roleRepository.AddAsync(role);
            await _roleRepository.SaveChangesAsync();

            if (dto.PermissionIds != null && dto.PermissionIds.Any())
            {
                await AssignPermissionsToRoleAsync(role.Id, dto.PermissionIds);
            }

            return (await _roleRepository.GetByIdWithPermissionsAsync(role.Id))!.ToDto();
        }

        public async Task<RoleDto> UpdateAsync(UpdateRoleDto dto)
        {
            throw new NotImplementedException("Update cần roleId, hãy dùng UpdateRoleAsync");
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null) return false;

            await _rolePermissionRepository.RemoveAllByRoleIdAsync(id);
            _roleRepository.Delete(role);
            await _roleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            return role != null;
        }

        public async Task SaveChangesAsync()
        {
            await _roleRepository.SaveChangesAsync();
        }

        public async Task<RoleDto?> GetRoleByNameAsync(string name)
        {
            var role = await _roleRepository.GetByNameAsync(name);
            return role?.ToDto();
        }

        public async Task<RoleDto?> GetRoleWithPermissionsAsync(Guid roleId)
        {
            var role = await _roleRepository.GetByIdWithPermissionsAsync(roleId);
            return role?.ToDto();
        }

        public async Task<(IEnumerable<RoleSummaryDto> Roles, int TotalCount)> GetPagedRolesAsync(
            int page, int size, string? search = null)
        {
            var (roles, totalCount) = await _roleRepository.GetPagedAsync(page, size, search);
            var roleSummaries = roles.Select(r => r.ToSummaryDto());
            return (roleSummaries, totalCount);
        }

        public async Task<bool> AssignPermissionsToRoleAsync(Guid roleId, List<Guid> permissionIds)
        {
            var roleExists = await _roleRepository.GetByIdAsync(roleId) != null;
            if (!roleExists) return false;

            await _rolePermissionRepository.RemoveAllByRoleIdAsync(roleId);

            var rolePermissions = permissionIds.Select(permissionId => new Domain.Entities.Identity.RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            });

            await _rolePermissionRepository.AddRangeAsync(rolePermissions);
            await _rolePermissionRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId)
        {
            if (!await _rolePermissionRepository.ExistsAsync(roleId, permissionId))
                return false;

            await _rolePermissionRepository.RemoveAsync(roleId, permissionId);
            await _rolePermissionRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PermissionDto>> GetRolePermissionsAsync(Guid roleId)
        {
            var permissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleId);
            return permissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description
            });
        }

        public async Task<bool> RoleNameExistsAsync(string name)
        {
            return await _roleRepository.ExistsByNameAsync(name);
        }
    }
}
