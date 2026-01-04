using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookStore.Shared.Utilities;

namespace BookStore.Infrastructure.Repository.Identity.User
{

    public class UserRepository : GenericRepository<Domain.Entities.Identity.User>, IUserRepository
    {

        public UserRepository(AppDbContext context) : base(context)
        {
        }

        #region Override Generic Repository Methods

        public override async Task<IEnumerable<Domain.Entities.Identity.User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Domain.Entities.Identity.User?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty", nameof(id));

            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public override async Task AddAsync(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // Set default values n?u chua c�
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (entity.CreateAt == default)
                entity.CreateAt = DateTime.UtcNow;

            if (!entity.UpdatedAt.HasValue)
                entity.UpdatedAt = DateTime.UtcNow;

            await base.AddAsync(entity);
        }

        public override void Update(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // T? d?ng set UpdatedAt
            entity.UpdatedAt = DateTime.UtcNow;

            base.Update(entity);
        }

        public override void Delete(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Delete(entity);
        }

        #endregion

        #region IUserRepository Specific Methods

        public async Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<Domain.Entities.Identity.User?> GetByIdWithAllDetailsAsync(Guid id)
        {
            if (id == Guid.Empty)
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.Addresses)
                .Include(u => u.Devices)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .Include(u => u.RefreshTokens)
                .AsSplitQuery()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<(IEnumerable<Domain.Entities.Identity.User> Users, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null)
        {
            // Validate parameters
            if (pageNumber < 1)
                pageNumber = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 20)
                pageSize = 20; // Gi?i h?n t?i da 20 items/page

            var query = _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.Trim().ToLower();
                query = query.Where(u =>
                    u.Email.ToLower().Contains(searchTerm) ||
                    (u.Profiles != null && u.Profiles.FullName.ToLower().Contains(searchTerm))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination and ordering
            var users = await query
                .OrderByDescending(u => u.CreateAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (users, totalCount);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<Domain.Entities.Identity.User?> GetUserForAuthenticationAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .AsSplitQuery()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower() && u.IsActive);
        }


        public async Task<IEnumerable<string>> GetUserPermissionNamesAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<string>();

            var permissionNames = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            return permissionNames;
        }

        #endregion

        #region Authentication Operations
        public async Task<Domain.Entities.Identity.User?> AuthenticateAsync(string email, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(passwordHash))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .AsSplitQuery()
                .FirstOrDefaultAsync(u => 
                    u.Email.ToLower() == email.ToLower() 
                    && u.PasswordHash == passwordHash 
                    && u.IsActive);
        }

        public async Task<Domain.Entities.Identity.User?> GetUserWithRolesAndPermissionsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .AsSplitQuery()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> VerifyEmailAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Password Management

        public async Task<bool> UpdatePasswordAsync(Guid userId, string newPasswordHash)
        {
            if (userId == Guid.Empty || string.IsNullOrWhiteSpace(newPasswordHash))
                return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.PasswordHash = newPasswordHash;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Account Management

        public async Task<bool> LockUserAccountAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockUserAccountAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion
    }
}
