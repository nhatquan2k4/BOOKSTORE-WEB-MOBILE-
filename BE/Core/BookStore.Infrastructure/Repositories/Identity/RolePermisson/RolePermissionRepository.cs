using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity.RolePermisson
{
    public class RolePermissionRepository : ManyToManyRepository<RolePermission>, IRolePermissionRepository
    {
        public RolePermissionRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<RolePermission>> GetByLeftKeyAsync(Guid roleId)
        {
            return await GetByRoleIdAsync(roleId);
        }

        public override async Task<IEnumerable<RolePermission>> GetByRightKeyAsync(Guid permissionId)
        {
            return await GetByPermissionIdAsync(permissionId);
        }

        public override async Task RemoveAsync(Guid roleId, Guid permissionId)
        {
            var rolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

            if (rolePermission != null)
            {
                _context.RolePermissions.Remove(rolePermission);
            }
        }

        public override async Task RemoveAllByLeftKeyAsync(Guid roleId)
        {
            await RemoveAllByRoleIdAsync(roleId);
        }

        public override async Task<bool> ExistsAsync(Guid roleId, Guid permissionId)
        {
            return await _context.RolePermissions
                .AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
        }

        public async Task<IEnumerable<RolePermission>> GetByRoleIdAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
                return Enumerable.Empty<RolePermission>();

            return await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == roleId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<RolePermission>> GetByPermissionIdAsync(Guid permissionId)
        {
            if (permissionId == Guid.Empty)
                return Enumerable.Empty<RolePermission>();

            return await _context.RolePermissions
                .Include(rp => rp.Role)
                .Where(rp => rp.PermissionId == permissionId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task RemoveAllByRoleIdAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
                return;

            var rolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(rolePermissions);
        }
    }
}
