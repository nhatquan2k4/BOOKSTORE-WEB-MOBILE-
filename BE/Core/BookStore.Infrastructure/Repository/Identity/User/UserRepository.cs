using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    /// <summary>
    /// Repository để quản lý các thao tác database với User entity
    /// Kế thừa từ GenericRepository và implement IUserRepository
    /// </summary>
    public class UserRepository : GenericRepository<Domain.Entities.Identity.User>, IUserRepository
    {
        /// <summary>
        /// Constructor nhận AppDbContext từ DI container
        /// </summary>
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        #region Override Generic Repository Methods

        /// <summary>
        /// Override GetAllAsync để eager load các navigation properties
        /// Include: Profiles, UserRoles với Role
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
        /// Override GetByIdAsync để eager load các navigation properties
        /// Include: Profiles, UserRoles với Role
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User entity hoặc null nếu không tìm thấy</returns>
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
        /// Override AddAsync để validate và set default values
        /// </summary>
        /// <param name="entity">User entity cần thêm</param>
        /// <exception cref="ArgumentNullException">Khi entity là null</exception>
        public override async Task AddAsync(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // Set default values nếu chưa có
            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (entity.CreateAt == default)
                entity.CreateAt = DateTime.UtcNow;

            if (!entity.UpdatedAt.HasValue)
                entity.UpdatedAt = DateTime.UtcNow;

            await base.AddAsync(entity);
        }

        /// <summary>
        /// Override Update để tự động cập nhật UpdatedAt timestamp
        /// </summary>
        /// <param name="entity">User entity cần update</param>
        /// <exception cref="ArgumentNullException">Khi entity là null</exception>
        public override void Update(Domain.Entities.Identity.User entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            // Tự động set UpdatedAt
            entity.UpdatedAt = DateTime.UtcNow;

            base.Update(entity);
        }

        /// <summary>
        /// Override Delete để validate
        /// </summary>
        /// <param name="entity">User entity cần xóa</param>
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
        /// <param name="email">Email cần tìm</param>
        /// <returns>User entity hoặc null nếu không tìm thấy</returns>
        public async Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _context.Users
                .Include(u => u.Profiles)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        /// <summary>
        /// Lấy user với TẤT CẢ thông tin chi tiết
        /// Include: Profiles, Addresses, Devices, UserRoles > Role > RolePermissions > Permission, RefreshTokens
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User entity với đầy đủ thông tin hoặc null</returns>
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
                .AsSplitQuery() // Tối ưu performance khi include nhiều collection
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        /// <summary>
        /// Lấy danh sách user có phân trang và tìm kiếm
        /// Tìm kiếm theo: Email hoặc FullName trong Profile
        /// Sắp xếp: Mới nhất lên đầu (CreateAt DESC)
        /// </summary>
        /// <param name="pageNumber">Số trang (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số lượng item mỗi trang</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm (optional)</param>
        /// <returns>Tuple chứa danh sách User và tổng số record</returns>
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
                pageSize = 20; // Giới hạn tối đa 20 items/page

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
        /// Kiểm tra email đã tồn tại trong hệ thống chưa
        /// </summary>
        /// <param name="email">Email cần kiểm tra</param>
        /// <returns>true nếu email đã tồn tại, false nếu chưa</returns>
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        /// <summary>
        /// Lấy thông tin user cho mục đích authentication
        /// Chỉ lấy user có IsActive = true
        /// Include: Profiles, UserRoles > Role > RolePermissions > Permission
        /// </summary>
        /// <param name="email">Email của user</param>
        /// <returns>User entity với đầy đủ roles và permissions hoặc null</returns>
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
        /// Lấy danh sách tên các permissions của user
        /// Lấy thông qua UserRoles > Role > RolePermissions > Permission
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
    }
}