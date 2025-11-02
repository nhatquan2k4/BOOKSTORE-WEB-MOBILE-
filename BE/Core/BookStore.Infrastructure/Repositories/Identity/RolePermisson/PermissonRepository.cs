using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStore.Shared.Utilities;
using BookStore.Shared.Exceptions;

namespace BookStore.Infrastructure.Repository.Identity.RolePermisson
{
    public class PermissionRepository : GenericRepository<Permission>, IPermissionRepository
    {
        public PermissionRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Permission>> GetAllAsync()
        {
            return await _context.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public override async Task<Permission?> GetByIdAsync(Guid id)
        {
            Guard.Against(id == Guid.Empty, "Id không được để trống");

            return await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public override async Task AddAsync(Permission entity)
        {
            Guard.Against(entity == null, "Entity không được null");
            Guard.AgainstNullOrWhiteSpace(entity!.Name, nameof(entity.Name));

            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (await ExistsByNameAsync(entity.Name))
                throw new UserFriendlyException($"Permission với tên '{entity.Name}' đã tồn tại");

            await base.AddAsync(entity);
        }

        public override void Update(Permission entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Update(entity!);
        }

        public override void Delete(Permission entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Delete(entity!);
        }

        public async Task<Permission?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            return await _context.Permissions
                .FirstOrDefaultAsync(p => p.Name.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
                return Enumerable.Empty<Permission>();

            return await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission)
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<Permission>();

            return await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission)
                .Distinct()
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return false;

            return await _context.Permissions
                .AnyAsync(p => p.Name.ToLower() == name.ToLower());
        }
    }
}
