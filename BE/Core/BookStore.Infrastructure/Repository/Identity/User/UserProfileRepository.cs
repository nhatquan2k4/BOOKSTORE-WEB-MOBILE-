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
    public class UserProfileRepository : GenericRepository<UserProfile>, IUserProfileRepository
    {
        public UserProfileRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<UserProfile>> GetAllAsync()
        {
            return await _context.UserProfiles
                .Include(up => up.User)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<UserProfile?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty", nameof(id));

            return await _context.UserProfiles
                .Include(up => up.User)
                .FirstOrDefaultAsync(up => up.Id == id);
        }

        public override async Task AddAsync(UserProfile entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            await base.AddAsync(entity);
        }

        public override void Update(UserProfile entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Update(entity);
        }

        public override void Delete(UserProfile entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Delete(entity);
        }

        public async Task<UserProfile?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return null;

            return await _context.UserProfiles
                .Include(up => up.User)
                .FirstOrDefaultAsync(up => up.UserId == userId);
        }

        public async Task<bool> ExistsByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return false;

            return await _context.UserProfiles
                .AnyAsync(up => up.UserId == userId);
        }
    }
}
