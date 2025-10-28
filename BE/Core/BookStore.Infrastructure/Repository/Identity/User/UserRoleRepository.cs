using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    public class UserRoleRepository : ManyToManyRepository<UserRole>, IUserRoleRepository
    {
        public UserRoleRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<UserRole>> GetByLeftKeyAsync(Guid userId)
        {
            return await GetByUserIdAsync(userId);
        }

        public override async Task<IEnumerable<UserRole>> GetByRightKeyAsync(Guid roleId)
        {
            return await GetByRoleIdAsync(roleId);
        }

        public override async Task RemoveAsync(Guid userId, Guid roleId)
        {
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

            if (userRole != null)
            {
                _context.UserRoles.Remove(userRole);
            }
        }

        public override async Task RemoveAllByLeftKeyAsync(Guid userId)
        {
            await RemoveAllByUserIdAsync(userId);
        }

        public override async Task<bool> ExistsAsync(Guid userId, Guid roleId)
        {
            return await _context.UserRoles
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
        }

        public async Task<IEnumerable<UserRole>> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<UserRole>();

            return await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.UserId == userId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<UserRole>> GetByRoleIdAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
                return Enumerable.Empty<UserRole>();

            return await _context.UserRoles
                .Include(ur => ur.User)
                .Where(ur => ur.RoleId == roleId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task RemoveAllByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return;

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .ToListAsync();

            _context.UserRoles.RemoveRange(userRoles);
        }
    }
}
