using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly AppDbContext _context;

        public UserRoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserRole>> GetAllAsync()
        {
            return await _context.UserRoles
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<UserRole?> GetByIdAsync(Guid id)
        {
            return null;
        }

        public async Task AddAsync(UserRole entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (await ExistsAsync(entity.UserId, entity.RoleId))
                throw new InvalidOperationException($"User {entity.UserId} already has role {entity.RoleId}");

            await _context.UserRoles.AddAsync(entity);
        }

        public void Update(UserRole entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            _context.UserRoles.Update(entity);
        }

        public void Delete(UserRole entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            _context.UserRoles.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
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

        public async Task AddRangeAsync(IEnumerable<UserRole> userRoles)
        {
            if (userRoles == null || !userRoles.Any())
                throw new ArgumentNullException(nameof(userRoles));

            await _context.UserRoles.AddRangeAsync(userRoles);
        }

        public async Task RemoveAllByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return;

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .ToListAsync();

            if (userRoles.Any())
            {
                _context.UserRoles.RemoveRange(userRoles);
            }
        }

        public async Task<bool> ExistsAsync(Guid userId, Guid roleId)
        {
            if (userId == Guid.Empty || roleId == Guid.Empty)
                return false;

            return await _context.UserRoles
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
        }
    }
}
