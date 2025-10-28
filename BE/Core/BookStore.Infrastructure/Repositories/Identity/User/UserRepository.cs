using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Interfaces.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<Domain.Entities.Identity.User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();
        }

        public async Task<Domain.Entities.Identity.User?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Invalid ID", nameof(id));
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddAsync(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            await _context.Users.AddAsync(entity);

        }

        public void Update(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            _context.Users.Update(entity);

        }

        public void Delete(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            _context.Users.Remove(entity);

        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }


        public async Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Profiles)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Domain.Entities.Identity.User?> GetByIdWithAllDetailsAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.Addresses)
                .Include(u => u.Devices)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<(IEnumerable<Domain.Entities.Identity.User> Users, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null)
        {
            var query = _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsQueryable();

            // Tìm kiếm theo email hoặc tên trong profile
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u =>
                    u.Email.ToLower().Contains(searchTerm) ||
                    (u.Profiles != null &&
                      u.Profiles.FullName.ToLower().Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreateAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email);
        }

        public async Task<Domain.Entities.Identity.User?> GetUserForAuthenticationAsync(string email)
        {
            // Chỉ lấy thông tin cần thiết cho authentication: User, Profile, Roles
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        }

        public async Task<IEnumerable<string>> GetUserPermissionNamesAsync(Guid userId)
        {
            // Lấy tất cả permission names của user thông qua các roles
            var permissionNames = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            return permissionNames;
        }
    }
}