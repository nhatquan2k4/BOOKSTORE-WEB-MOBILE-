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
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly AppDbContext _context;
        public UserProfileRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(UserProfile entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _context.UserProfiles.AddAsync(entity);
        }

        public async void Delete(UserProfile entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            var existingEntity = await _context.UserProfiles.FindAsync(entity.Id);
            if (existingEntity != null)
            {
                _context.UserProfiles.Remove(existingEntity);
            }

        }

        public async Task<bool> ExistsByUserIdAsync(Guid userId)
        {
           return await _context.UserProfiles.AnyAsync(up => up.UserId == userId);

        }

        public async Task<IEnumerable<UserProfile>> GetAllAsync()
        {
            return await _context.UserProfiles.
                Include(up => up.User).
                ToListAsync();
        }

        public async Task<UserProfile?> GetByIdAsync(Guid id)
        {
            return await _context.UserProfiles.
                Include(up => up.User).
                FirstOrDefaultAsync(up => up.Id == id);
        }

        public async Task<UserProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserProfiles.
                Include(up => up.User).
                FirstOrDefaultAsync(up => up.UserId == userId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Update(UserProfile entity)
        {
            _context.UserProfiles.Update(entity);
        }
    }   
}
