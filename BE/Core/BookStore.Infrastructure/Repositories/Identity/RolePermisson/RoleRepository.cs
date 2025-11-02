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
    public class RoleRepository : GenericRepository<Role>, IRoleRepository
    {
        public RoleRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Role>> GetAllAsync()
        {
            return await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Role?> GetByIdAsync(Guid id)
        {
            Guard.Against(id == Guid.Empty, "Id không được để trống");

            return await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public override async Task AddAsync(Role entity)
        {
            Guard.Against(entity == null, "Entity không được null");
            Guard.AgainstNullOrWhiteSpace(entity!.Name, nameof(entity.Name));

            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (await ExistsByNameAsync(entity.Name))
                throw new UserFriendlyException($"Role với tên '{entity.Name}' đã tồn tại");

            await base.AddAsync(entity);
        }

        public override void Update(Role entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Update(entity!);
        }

        public override void Delete(Role entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Delete(entity!);
        }

        public async Task<Role?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            return await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower());
        }

        public async Task<Role?> GetByIdWithPermissionsAsync(Guid id)
        {
            if (id == Guid.Empty)
                return null;

            return await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .AsSplitQuery()
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Role>> GetRolesByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<Role>();

            return await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.Role)
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return false;

            return await _context.Roles
                .AnyAsync(r => r.Name.ToLower() == name.ToLower());
        }

        public async Task<(IEnumerable<Role>, int)> GetPagedAsync(int page, int size, string? search)
        {
            if (page < 1)
                page = 1;

            if (size < 1)
                size = 10;

            if (size > 100)
                size = 100;

            var query = _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(r =>
                    r.Name.ToLower().Contains(search) ||
                    r.Description.ToLower().Contains(search)
                );
            }

            var totalCount = await query.CountAsync();

            var roles = await query
                .OrderBy(r => r.Name)
                .Skip((page - 1) * size)
                .Take(size)
                .AsNoTracking()
                .ToListAsync();

            return (roles, totalCount);
        }
    }
}
