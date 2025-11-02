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
    /// <summary>
    /// Repository d? qu?n lý các thao tác database v?i User entity
    /// K? th?a t? GenericRepository và implement IUserRepository
    /// </summary>
    public class UserRepository : GenericRepository<Domain.Entities.Identity.User>, IUserRepository
    {
        /// <summary>
        /// Constructor nh?n AppDbContext t? DI container
        /// </summary>
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        #region Override Generic Repository Methods

        /// <summary>
        /// Override GetAllAsync d? eager load các navigation properties
        /// Include: Profiles, UserRoles v?i Role
        /// </summary>
        public override async Task<IEnumerable<Domain.Entities.Identity.User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Profiles)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .ToListAsync();
        }

        /// <summary>
        /// Override GetByIdAsync d? eager load các navigation properties
        /// Include: Profiles, UserRoles v?i Role
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User entity ho?c null n?u không tìm th?y</returns>
        /// <exception cref="ArgumentException">Khi id là Guid.Empty</exception>
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

        /// <summary>
        /// Override AddAsync d? validate và set default values
        /// </summary>
        /// <param name="entity">User entity c?n thêm</param>
        /// <exception cref="ArgumentNullException">Khi entity là null</exception>
        public override async Task AddAsync(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // Set default values n?u chua có
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (entity.CreateAt == default)
                entity.CreateAt = DateTime.UtcNow;

            if (!entity.UpdatedAt.HasValue)
                entity.UpdatedAt = DateTime.UtcNow;

            await base.AddAsync(entity);
        }

        /// <summary>
        /// Override Update d? t? d?ng c?p nh?t UpdatedAt timestamp
        /// </summary>
        /// <param name="entity">User entity c?n update</param>
        /// <exception cref="ArgumentNullException">Khi entity là null</exception>
        public override void Update(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // T? d?ng set UpdatedAt
            entity.UpdatedAt = DateTime.UtcNow;

            base.Update(entity);
        }

        /// <summary>
        /// Override Delete d? validate
        /// </summary>
        /// <param name="entity">User entity c?n xóa</param>
        /// <exception cref="ArgumentNullException">Khi entity là null</exception>
        public override void Delete(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Delete(entity);
        }

        #endregion

        #region IUserRepository Specific Methods

        /// <summary>
        /// Tìm user theo email
        /// Include: Profiles
        /// </summary>
        /// <param name="email">Email c?n tìm</param>
        /// <returns>User entity ho?c null n?u không tìm th?y</returns>
        public async Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        /// <summary>
        /// L?y user v?i T?T C? thông tin chi ti?t
        /// Include: Profiles, Addresses, Devices, UserRoles > Role > RolePermissions > Permission, RefreshTokens
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User entity v?i d?y d? thông tin ho?c null</returns>
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
                .AsSplitQuery() // T?i uu performance khi include nhi?u collection
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        /// <summary>
        /// L?y danh sách user có phân trang và tìm ki?m
        /// Tìm ki?m theo: Email ho?c FullName trong Profile
        /// S?p x?p: M?i nh?t lên d?u (CreateAt DESC)
        /// </summary>
        /// <param name="pageNumber">S? trang (b?t d?u t? 1)</param>
        /// <param name="pageSize">S? lu?ng item m?i trang</param>
        /// <param name="searchTerm">T? khóa tìm ki?m (optional)</param>
        /// <returns>Tuple ch?a danh sách User và t?ng s? record</returns>
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

        /// <summary>
        /// Ki?m tra email dã t?n t?i trong h? th?ng chua
        /// </summary>
        /// <param name="email">Email c?n ki?m tra</param>
        /// <returns>true n?u email dã t?n t?i, false n?u chua</returns>
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        /// <summary>
        /// L?y thông tin user cho m?c dích authentication
        /// Ch? l?y user có IsActive = true
        /// Include: Profiles, UserRoles > Role > RolePermissions > Permission
        /// </summary>
        /// <param name="email">Email c?a user</param>
        /// <returns>User entity v?i d?y d? roles và permissions ho?c null</returns>
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

        /// <summary>
        /// L?y danh sách tên các permissions c?a user
        /// L?y thông qua UserRoles > Role > RolePermissions > Permission
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Danh sách tên permissions (unique)</returns>
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

        /// <summary>
        /// Xác th?c user v?i email và password hash
        /// </summary>
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

        /// <summary>
        /// L?y user v?i Roles và Permissions
        /// </summary>
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

        /// <summary>
        /// Xác minh email c?a user
        /// </summary>
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

        /// <summary>
        /// C?p nh?t password m?i
        /// </summary>
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

        /// <summary>
        /// Khóa tài kho?n user
        /// </summary>
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

        /// <summary>
        /// M? khóa tài kho?n user
        /// </summary>
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
