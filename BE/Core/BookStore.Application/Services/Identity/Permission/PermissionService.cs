using BookStore.Application.Dtos.Identity.Permission;
using BookStore.Application.IService.Identity.Permission;
using BookStore.Application.Mappers.Identity.RolePermission;
using BookStore.Domain.IRepository.Identity.RolePermisson;

namespace BookStore.Application.Services.Identity.Permission
{
    public class PermissionService : IPermissionService
    {
        private readonly IPermissionRepository _permissionRepository;

        public PermissionService(IPermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
        }

        public async Task<IEnumerable<PermissionDto>> GetAllAsync()
        {
            var permissions = await _permissionRepository.GetAllAsync();
            return permissions.Select(p => p.ToDto());
        }

        public async Task<PermissionDto?> GetByIdAsync(Guid id)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            return permission?.ToDto();
        }

        public async Task<PermissionDto> AddAsync(CreatePermissionDto dto)
        {
            if (await _permissionRepository.ExistsByNameAsync(dto.Name))
                throw new InvalidOperationException("Tên permission đã tồn tại");

            var permission = dto.ToEntity();
            await _permissionRepository.AddAsync(permission);
            await _permissionRepository.SaveChangesAsync();

            return permission.ToDto();
        }

        public async Task<PermissionDto> UpdateAsync(UpdatePermissionDto dto)
        {
            throw new NotImplementedException("Update cần permissionId, hãy dùng UpdatePermissionAsync");
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            if (permission == null) return false;

            _permissionRepository.Delete(permission);
            await _permissionRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);
            return permission != null;
        }

        public async Task SaveChangesAsync()
        {
            await _permissionRepository.SaveChangesAsync();
        }

        public async Task<PermissionDto?> GetPermissionByNameAsync(string name)
        {
            var permission = await _permissionRepository.GetByNameAsync(name);
            return permission?.ToDto();
        }

        public async Task<IEnumerable<PermissionDto>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            var permissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleId);
            return permissions.Select(p => p.ToDto());
        }

        public async Task<IEnumerable<PermissionDto>> GetPermissionsByUserIdAsync(Guid userId)
        {
            var permissions = await _permissionRepository.GetPermissionsByUserIdAsync(userId);
            return permissions.Select(p => p.ToDto());
        }

        public async Task<bool> PermissionNameExistsAsync(string name)
        {
            return await _permissionRepository.ExistsByNameAsync(name);
        }
    }
}
