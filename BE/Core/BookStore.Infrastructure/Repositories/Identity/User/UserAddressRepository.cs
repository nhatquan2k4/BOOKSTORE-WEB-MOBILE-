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
    public class UserAddressRepository : GenericRepository<UserAddress>, IUserAddressRepository
    {
        public UserAddressRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<UserAddress>> GetAllAsync()
        {
            return await _context.UserAddresses
                .Include(ua => ua.User)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<UserAddress?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty", nameof(id));

            return await _context.UserAddresses
                .Include(ua => ua.User)
                .FirstOrDefaultAsync(ua => ua.Id == id);
        }

        public override async Task AddAsync(UserAddress entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (entity.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            if (entity.IsDefault)
            {
                await UnsetDefaultForUserAsync(entity.UserId);
            }

            await base.AddAsync(entity);
        }

        public override void Update(UserAddress entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Update(entity);
        }

        public override void Delete(UserAddress entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            base.Delete(entity);
        }

        public async Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<UserAddress>();

            return await _context.UserAddresses
                .Include(ua => ua.User)
                .Where(ua => ua.UserId == userId)
                .OrderByDescending(ua => ua.IsDefault)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<UserAddress?> GetDefaultAddressByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return null;

            return await _context.UserAddresses
                .Include(ua => ua.User)
                .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.IsDefault);
        }

        public async Task SetDefaultAddressAsync(Guid addressId, Guid userId)
        {
            if (addressId == Guid.Empty || userId == Guid.Empty)
                return;

            await UnsetDefaultForUserAsync(userId);

            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address != null)
            {
                address.IsDefault = true;
                _context.UserAddresses.Update(address);
            }
        }

        private async Task UnsetDefaultForUserAsync(Guid userId)
        {
            var defaultAddresses = await _context.UserAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();

            foreach (var address in defaultAddresses)
            {
                address.IsDefault = false;
            }

            if (defaultAddresses.Any())
            {
                _context.UserAddresses.UpdateRange(defaultAddresses);
            }
        }
    }
}
